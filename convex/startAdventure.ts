import { action, mutation, query } from "./_generated/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function buildTurnPrompt(params: {
  playerClass: string,
  stats: any,
  currentSituation: string,
  recentHistory: string,
  playerAction: string,
  inventory: Array<{ name: string, quantity: number, description?: string }>,
  forceEvent?: boolean
}) {
  return {
    systemPrompt: `You are a Dungeon Master. Respond with JSON containing:
- "outcome" (the story result)
- "glossaryTerms" (array of {term, definition} objects for any new concepts)
- "inventoryChanges" (array of {name, quantityChange, description?, reason?} objects for items gained/lost)
- "requiresRoll" (boolean - true if this action needs a stat check)
- "statToRoll" (string - "str", "dex", "con", "int", "wis", or "cha" if requiresRoll is true)
- "rollDC" (number - difficulty class from 10-20 if requiresRoll is true, where 10=trivial, 15=moderate, 20=very hard)
- "statAdjustment" (boolean - true if this action affects player stats like HP/MP)
- "statToAdjust" (string - "hp", "mp", "str", "dex", "con", "int", "wis", or "cha" if statAdjustment is true)
- "adjustmentAmount" (number - positive for gain, negative for loss if statAdjustment is true)
- "proactiveEvent" (string or null - occasionally generate world events that require player decisions)
- "eventOptions" (array of strings or null - if proactiveEvent is set, provide 2-4 choice options for the player)

Example: {
  "outcome": "You attempt to climb the steep cliff face...",
  "glossaryTerms": [],
  "inventoryChanges": [],
  "requiresRoll": true,
  "statToRoll": "str",
  "rollDC": 15,
  "statAdjustment": false,
  "statToAdjust": null,
  "adjustmentAmount": 0,
  "proactiveEvent": null,
  "eventOptions": null
}

Example with spell: {
  "outcome": "You cast a powerful fireball spell, scorching the enemies but draining your magical energy.",
  "glossaryTerms": [],
  "inventoryChanges": [],
  "requiresRoll": false,
  "statToRoll": null,
  "rollDC": null,
  "statAdjustment": true,
  "statToAdjust": "mp",
  "adjustmentAmount": -12,
  "proactiveEvent": null,
  "eventOptions": null
}

Example with event: {
  "outcome": "You successfully gather berries from the bush.",
  "glossaryTerms": [],
  "inventoryChanges": [{"name": "Wild Berries", "quantityChange": 3, "description": "Fresh forest berries"}],
  "requiresRoll": false,
  "statToRoll": null,
  "rollDC": null,
  "statAdjustment": false,
  "statToAdjust": null,
  "adjustmentAmount": 0,
  "proactiveEvent": "A hooded stranger approaches from the shadows, offering to trade rare herbs for your berries.",
  "eventOptions": ["Accept the trade", "Politely decline and walk away", "Ask what the herbs do first", "Draw your weapon defensively"]
}`,
    userPrompt: `Player Character: ${params.playerClass} with stats ${JSON.stringify(params.stats)}

Current Inventory: ${JSON.stringify(params.inventory)}

Current Situation: ${params.currentSituation}

Recent History:
${params.recentHistory}

Player Action: ${params.playerAction}

Generate the outcome of this action. Consider the player's stats, class abilities, and available inventory.
Be creative, engaging, and include potential consequences or new opportunities.
Keep responses concise but vivid (2-3 sentences max).

STAT CHECKS: Set requiresRoll to true and specify statToRoll and rollDC when actions involve:
- Physical tasks (climbing, jumping, breaking things) -> "str" or "dex"
- Mental tasks (solving puzzles, remembering lore) -> "int" or "wis"
- Social interactions (persuasion, intimidation) -> "cha"
- Endurance/survival tasks -> "con"

DIFFICULTY CLASSES: Set rollDC based on task difficulty:
- DC 10: Trivial tasks (climbing a rope, basic social interaction)
- DC 12: Easy tasks (simple acrobatics, easy puzzle)
- DC 15: Moderate tasks (scaling a wall, complex negotiation)
- DC 18: Hard tasks (dangerous climb, difficult riddle)
- DC 20: Very hard tasks (near-impossible feats)

PROACTIVE EVENTS: ${params.forceEvent ? 'GENERATE A PROACTIVE EVENT for this response' : 'Do NOT generate a proactive event for this response'}. ${params.forceEvent ? `
Create a proactiveEvent to make the world feel alive:
- Environmental challenges ("A storm approaches, seek shelter!")
- NPCs approaching with requests/offers
- Discovery of interesting locations or items
- Moral dilemmas or choices
- Signs of danger or opportunity

When you create a proactiveEvent, ALWAYS provide eventOptions with 2-4 meaningful choices that let the player engage with the situation. Make choices distinct and interesting, not just "yes/no". Consider the player's class and stats when crafting options.` : ''}

When appropriate, include inventory changes (items gained, lost, used, or discovered).
Use negative quantityChange for items lost/used, positive for items gained.

STAT ADJUSTMENTS: Set statAdjustment to true when actions affect player stats:
- Spell casting: reduces MP (e.g., "mp", -10 for a fireball spell)
- Taking damage: reduces HP (e.g., "hp", -8 from enemy attack)
- Healing: restores HP (e.g., "hp", +15 from potion)
- Rest/meditation: restores MP (e.g., "mp", +5 from short rest)
- Permanent stat changes: from magical effects (e.g., "str", +1 from strength potion)

Always mention the stat cost/effect in the outcome text (e.g., "This costs 12 MP" or "You take 5 damage").`
  };
}

export const createWorld = action(async (context, params: { playerClass: string, stats: any }) => {
  const systemPrompt = `
  You are a Dungeon Master. Create a fantasy world setting for the player:
  Class: ${params.playerClass}
  Stats: ${JSON.stringify(params.stats)}
  The world should be rich but concise.
  Output ONLY a short description of the world and the player's starting location.
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-5-nano",
    reasoning_effort: "medium",
    messages: [{ role: "system", content: systemPrompt }],
  });

  const text = completion.choices[0].message?.content ?? "A mysterious land awaits.";

  return { worldId: -1, startText: text }
});

export const takeTurnWithRoll = action(async (context, params: {
  playerAction: string,
  playerClass: string,
  stats: any,
  currentSituation: string,
  actionHistory: Array<{ type: string, text: string }>,
  inventory: Array<{ name: string, quantity: number, description?: string }>,
  rollResult: number,
  statRolled: string,
  success: boolean
}) => {
  const recentHistory = params.actionHistory.slice(-3).map(entry =>
    `${entry.type === 'world' ? 'SETTING' : entry.type === 'action' ? 'PLAYER' : 'OUTCOME'}: ${entry.text}`
  ).join('\n');

  const rollPrompt = {
    systemPrompt: `You are a Dungeon Master. The player attempted an action requiring a ${params.statRolled.toUpperCase()} check.
They rolled ${params.rollResult} and ${params.success ? 'SUCCEEDED' : 'FAILED'}.

Respond with JSON containing:
- "outcome" (the story result based on the roll)
- "glossaryTerms" (array of {term, definition} objects for any new concepts)
- "inventoryChanges" (array of {name, quantityChange, description?, reason?} objects for items gained/lost)
- "statAdjustment" (boolean - true if this action affects player stats like HP/MP)
- "statToAdjust" (string - "hp", "mp", "str", "dex", "con", "int", "wis", or "cha" if statAdjustment is true)
- "adjustmentAmount" (number - positive for gain, negative for loss if statAdjustment is true)
- "proactiveEvent" (string or null - occasionally generate world events that require player decisions)
- "eventOptions" (array of strings or null - if proactiveEvent is set, provide 2-4 choice options for the player)

Base the outcome on whether they succeeded or failed the roll. Make failures interesting, not just dead ends.`,
    userPrompt: `Player Character: ${params.playerClass} with stats ${JSON.stringify(params.stats)}

Current Inventory: ${JSON.stringify(params.inventory)}

Current Situation: ${params.currentSituation}

Recent History:
${recentHistory}

Player Action: ${params.playerAction}
Stat Rolled: ${params.statRolled.toUpperCase()}
Roll Result: ${params.rollResult}
Success: ${params.success ? 'YES' : 'NO'}

Generate the outcome based on this roll result. Keep responses concise but vivid (2-3 sentences max).

STAT ADJUSTMENTS: Set statAdjustment to true when the action/outcome affects player stats:
- Spell casting: reduces MP
- Taking damage: reduces HP
- Healing: restores HP
- Rest/meditation: restores MP
- Permanent stat changes: from magical effects

Always mention the stat cost/effect in the outcome text.`
  };

  const completion = await openai.chat.completions.create({
    model: "gpt-5-nano",
    response_format: {
      type: "json_object"
    },
    reasoning_effort: "medium",
    messages: [
      {
        role: "system",
        content: rollPrompt.systemPrompt
      },
      {
        role: "user",
        content: rollPrompt.userPrompt
      }
    ]
  });

  const response = completion.choices[0].message?.content ?? '{"outcome": "The magical energies swirl unpredictably...", "glossaryTerms": [], "inventoryChanges": [], "proactiveEvent": null}';

  try {
    const parsed = JSON.parse(response);
    return {
      outcome: parsed.outcome || "The magical energies swirl unpredictably...",
      glossaryTerms: parsed.glossaryTerms || [],
      inventoryChanges: parsed.inventoryChanges || [],
      statAdjustment: parsed.statAdjustment || false,
      statToAdjust: parsed.statToAdjust || null,
      adjustmentAmount: parsed.adjustmentAmount || 0,
      proactiveEvent: parsed.proactiveEvent || null,
      eventOptions: parsed.eventOptions || null
    };
  } catch (error) {
    console.error("Failed to parse roll response:", error);
    return {
      outcome: response,
      glossaryTerms: [],
      inventoryChanges: [],
      statAdjustment: false,
      statToAdjust: null,
      adjustmentAmount: 0,
      proactiveEvent: null,
      eventOptions: null
    };
  }
});

export const takeTurn = action(async (context, params: {
  playerAction: string,
  playerClass: string,
  stats: any,
  currentSituation: string,
  actionHistory: Array<{ type: string, text: string }>,
  inventory: Array<{ name: string, quantity: number, description?: string }>,
  forceEvent?: boolean
}) => {
  const recentHistory = params.actionHistory.slice(-3).map(entry =>
    `${entry.type === 'world' ? 'SETTING' : entry.type === 'action' ? 'PLAYER' : 'OUTCOME'}: ${entry.text}`
  ).join('\n');

  const prompts = buildTurnPrompt({
    playerClass: params.playerClass,
    stats: params.stats,
    currentSituation: params.currentSituation,
    recentHistory,
    playerAction: params.playerAction,
    inventory: params.inventory,
    forceEvent: params.forceEvent
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-5-nano",
    response_format: {
      type: "json_object"
    },
    reasoning_effort: "medium",
    messages: [
      {
        role: "system",
        content: prompts.systemPrompt
      },
      {
        role: "user",
        content: prompts.userPrompt
      }
    ]
  });

  const response = completion.choices[0].message?.content ?? '{"outcome": "Something mysterious happens...", "glossaryTerms": [], "inventoryChanges": []}';

  try {
    const parsed = JSON.parse(response);
    return {
      outcome: parsed.outcome || "Something mysterious happens...",
      glossaryTerms: parsed.glossaryTerms || [],
      inventoryChanges: parsed.inventoryChanges || [],
      requiresRoll: parsed.requiresRoll || false,
      statToRoll: parsed.statToRoll || null,
      rollDC: parsed.rollDC || 15,
      statAdjustment: parsed.statAdjustment || false,
      statToAdjust: parsed.statToAdjust || null,
      adjustmentAmount: parsed.adjustmentAmount || 0,
      proactiveEvent: parsed.proactiveEvent || null,
      eventOptions: parsed.eventOptions || null
    };
  } catch (error) {
    console.error("Failed to parse structured response:", error);
    return {
      outcome: response,
      glossaryTerms: [],
      inventoryChanges: [],
      requiresRoll: false,
      statToRoll: null,
      rollDC: 15,
      statAdjustment: false,
      statToAdjust: null,
      adjustmentAmount: 0,
      proactiveEvent: null,
      eventOptions: null
    };
  }
});
