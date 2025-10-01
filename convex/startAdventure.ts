import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import OpenAI from "openai";
import { getDndDmSchema } from "./dmSchema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});



export const takeTurn = action({
  args: {
    adventureId: v.id("adventures"),
    userPrompt: v.string()
  },
  handler: async (ctx, params) => {
    console.time("takeTurn");
    // Add user action to the adventure log first
    await ctx.runMutation(api.adventures.addAdventureAction, {
      adventureId: params.adventureId,
      type: "action",
      content: params.userPrompt
    });

    // Fetch all required data from database
    console.time("getAdventureFromDB");
    const adventure = await ctx.runQuery(api.adventures.getAdventure, {
      adventureId: params.adventureId
    });
    console.timeEnd("getAdventureFromDB");

    if (!adventure) {
      throw new Error("Adventure not found");
    }

    const { adventure: adventureData, inventory, actions } = adventure;

    // Build recent history from actions
    const actionHistory = actions.map((action: any) => ({
      type: action.type,
      text: action.content
    }));

    const recentHistory = actionHistory.slice(-3).map((entry: any) =>
      `${entry.type === 'world' ? 'SETTING' : entry.type === 'action' ? 'PLAYER' : 'OUTCOME'}: ${entry.text}`
    ).join('\n');

    // Check if roll is needed
    const mostRecentResult = actionHistory.filter((action: any) => action.type === 'result').slice(-1)[0]?.text || "";
    const rollCheck = await getRollResultIfNeeded(params.userPrompt, mostRecentResult);

    let rollContext = "";
    if (rollCheck.requiresRoll) {
      const statToRoll = rollCheck.statToRoll;
      const rollDC = rollCheck.rollDC || 12;
      const statValue = Math.max(1, Math.min(30, adventureData.currentStats[statToRoll as keyof typeof adventureData.currentStats] || 10));
      const modifier = Math.floor((statValue - 10) / 2);
      const d20 = Math.floor(Math.random() * 20) + 1;
      const total = d20 + modifier;
      const success = total >= rollDC;

      // Add roll result to adventure log
      console.time("addRollResultToLog");
      await ctx.runMutation(api.adventures.addAdventureAction, {
        adventureId: params.adventureId,
        type: "roll",
        content: `🎲 Rolling ${statToRoll.toUpperCase()}... ${d20} + ${modifier} = ${total} vs DC ${rollDC} (${success ? "Success!" : "Failed!"})`
      });
      console.timeEnd("addRollResultToLog");

      rollContext = `\n\nROLL RESULT: ${statToRoll.toUpperCase()} check - rolled ${d20} + ${modifier} = ${total} vs DC ${rollDC} (${success ? 'SUCCESS' : 'FAILURE'})`;
    }

    // Determine if event should be triggered with smart cooldown system
    const shouldTriggerEvent = shouldTriggerWorldEvent(actions, adventureData.turnCount);

    // Generate AI response using streamlined prompt and JSON schema
    const systemPrompt = `You are a Dungeon Master. Generate the outcome of the player's action. Be creative, engaging, and include potential consequences or new opportunities. Keep responses concise but vivid (2-3 sentences max).${shouldTriggerEvent ? ' Include a proactive world event to make the story feel alive.' : ''}

IMPORTANT: The "outcome" field should ONLY contain the narrative result of the player's action. Do NOT include scene descriptions in the outcome text. Use the separate "sceneDescription" field (2-4 words) to describe the current location/environment (e.g., "dark forest", "tavern interior", "mountain peak").`;

    const userPrompt = `Player Character: ${adventureData.characterClass} with stats ${JSON.stringify(adventureData.currentStats)}

Current Inventory: ${JSON.stringify(inventory.map(item => ({ name: item.itemName, quantity: item.quantity, description: item.description })))}

Current Situation: ${adventureData.worldDescription}

Recent History:
${recentHistory}

Player Action: ${params.userPrompt}${rollContext}

Generate the outcome of this action considering the player's stats, class abilities, and available inventory.`;
    console.time("generateTakeTurnResponse");
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      response_format: {
        type: "json_schema",
        json_schema: getDndDmSchema(shouldTriggerEvent)
      },
      reasoning_effort: "minimal",
      max_completion_tokens: 600,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ]
    });
    console.timeEnd("generateTakeTurnResponse");

    const response = completion.choices[0].message?.content;
    if (!response) {
      console.error("OpenAI completion:", completion);
      throw new Error("No response from AI - completion was empty");
    }

    let parsed;
    try {
      parsed = JSON.parse(response);
    } catch (error) {
      console.error("Failed to parse AI response:", response);
      console.error("Parse error:", error);
      throw new Error("Invalid JSON response from AI");
    }

    // Add outcome to adventure log
    await ctx.runMutation(api.adventures.addAdventureAction, {
      adventureId: params.adventureId,
      type: "result",
      content: parsed.outcome
    });

    // Add proactive event if present
    if (parsed.proactiveEvent) {
      await ctx.runMutation(api.adventures.addAdventureAction, {
        adventureId: params.adventureId,
        type: "event",
        content: parsed.proactiveEvent,
        eventOptions: parsed.eventOptions || undefined
      });
    }

    // Update glossary if new terms
    if (parsed.glossaryTerms && parsed.glossaryTerms.length > 0) {
      await ctx.runMutation(api.adventures.updateAdventureGlossary, {
        adventureId: params.adventureId,
        glossaryTerms: parsed.glossaryTerms
      });
    }

    // Update inventory if changes
    if (parsed.inventoryChanges && parsed.inventoryChanges.length > 0) {
      await ctx.runMutation(api.adventures.updateAdventureInventory, {
        adventureId: params.adventureId,
        inventoryChanges: parsed.inventoryChanges
      });
    }

    // Update stats if adjustments
    if (parsed.statAdjustment && parsed.statToAdjust && parsed.adjustmentAmount !== 0) {
      await ctx.runMutation(api.adventures.updateAdventureStats, {
        adventureId: params.adventureId,
        statToAdjust: parsed.statToAdjust,
        adjustmentAmount: parsed.adjustmentAmount
      });
    }

    // Handle scene changes for dynamic backgrounds
    if (parsed.sceneDescription) {
      // Schedule background generation asynchronously so it doesn't block the UI
      ctx.scheduler.runAfter(0, api.backgrounds.handleSceneChange, {
        adventureId: params.adventureId,
        sceneDescription: parsed.sceneDescription
      });
      console.log("Scene change scheduled:", parsed.sceneDescription);
    }

    console.timeEnd("takeTurn");
    // Return minimal response - frontend will get updates via convex queries
    return {
      success: true
    };
  }
});

async function getRollResultIfNeeded(playerAction: string, mostRecentResult: string) {
  console.time("getRollResultIfNeeded");
  const rollCheck = await openai.chat.completions.create({
    model: "gpt-5-nano",
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "roll_check",
        schema: {
          type: "object",
          properties: {
            requiresRoll: { type: "boolean" },
            statToRoll: { type: "string", enum: ["str", "dex", "con", "int", "wis", "cha"] },
            rollDC: { type: "integer" }
          },
          required: ["requiresRoll"]
        }
      }
    },
    messages: [
      {
        role: "system",
        content:
          `You are a fast D&D rules assistant. Decide if the player's action requires a d20 roll. If yes, choose stat and DC.

DC Guidelines (5e standard):
- Easy/Routine tasks: 10-12 (talking, simple climbing, basic search)
- Medium difficulty: 13-15 (acrobatics, persuading, dodging)
- Hard/Challenging: 16-20 (complex magic, difficult feats)
- Very Hard: 21+ (nearly impossible tasks)

Use lower DCs (10-12) for most common actions. Only use 15+ for genuinely difficult tasks.`
      },
      {
        role: "user",
        content: JSON.stringify({
          mostRecentResult,
          playerAction
        })
      }
    ],
    max_completion_tokens: 50,
    reasoning_effort: "minimal"
  });
  console.timeEnd("getRollResultIfNeeded");
  return JSON.parse(rollCheck.choices[0].message.content!);
}

function shouldTriggerWorldEvent(actions: any[], currentTurn: number): boolean {
  // Find the most recent world event
  const lastEventAction = actions
    .filter(action => action.type === "event")
    .sort((a, b) => b.turnNumber - a.turnNumber)[0];

  const lastEventTurn = lastEventAction?.turnNumber || 0;
  const turnsSinceLastEvent = currentTurn - lastEventTurn;

  // Minimum cooldown: no events for at least 3 turns
  if (turnsSinceLastEvent < 3) {
    return false;
  }

  // Progressive probability system:
  // Turn 3-4: 10% chance
  // Turn 5-6: 20% chance  
  // Turn 7-8: 30% chance
  // Turn 9+: 40% chance (capped)
  let eventProbability: number;
  if (turnsSinceLastEvent <= 4) {
    eventProbability = 0.10;
  } else if (turnsSinceLastEvent <= 6) {
    eventProbability = 0.20;
  } else if (turnsSinceLastEvent <= 8) {
    eventProbability = 0.30;
  } else {
    eventProbability = 0.40;
  }

  return Math.random() < eventProbability;
}