import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { authComponent } from "./auth";
import OpenAI from "openai";
import { validatePointBuyStats, validateDerivedStats } from "./pointBuyValidation";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const getUserAdventures = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);

    if (!user) {
      throw new Error("Not authenticated");
    }

    const adventures = await ctx.db
      .query("adventures")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return adventures.filter(adventure => !adventure.deletedAt);
  },
});
export const getActiveAdventures = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const adventures = await ctx.db
      .query("adventures")
      .withIndex("by_status", (q) => q.eq("userId", user._id).eq("status", "active"))
      .order("desc")
      .collect();

    return adventures.filter(adventure => !adventure.deletedAt);
  },
});

export const getAdventure = query({
  args: { adventureId: v.id("adventures") },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const adventure = await ctx.db.get(args.adventureId);
    if (!adventure || adventure.userId !== user._id || adventure.deletedAt) {
      throw new Error("Adventure not found or access denied");
    }

    const [actions, inventory, glossary] = await Promise.all([
      ctx.db
        .query("adventureActions")
        .withIndex("by_adventure", (q) => q.eq("adventureId", args.adventureId))
        .order("asc")
        .collect(),
      ctx.db
        .query("adventureInventory")
        .withIndex("by_adventure", (q) => q.eq("adventureId", args.adventureId))
        .collect(),
      ctx.db
        .query("adventureGlossary")
        .withIndex("by_adventure", (q) => q.eq("adventureId", args.adventureId))
        .collect(),
    ]);

    return {
      adventure,
      actions,
      inventory,
      glossary,
    };
  },
});

export const getAdventureActions = query({
  args: { adventureId: v.id("adventures") },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const adventure = await ctx.db.get(args.adventureId);
    if (!adventure || adventure.userId !== user._id || adventure.deletedAt) {
      throw new Error("Adventure not found or access denied");
    }

    const actions = await ctx.db
      .query("adventureActions")
      .withIndex("by_adventure", (q) => q.eq("adventureId", args.adventureId))
      .order("asc")
      .collect();

    return actions;
  },
});

export const getActiveEvent = query({
  args: {
    adventureId: v.id("adventures"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const adventure = await ctx.db.get(args.adventureId);
    if (!adventure || adventure.userId !== user._id) {
      throw new Error("Adventure not found or access denied");
    }

    // Find the most recent event with options that hasn't been resolved
    const actions = await ctx.db
      .query("adventureActions")
      .withIndex("by_adventure", (q) => q.eq("adventureId", args.adventureId))
      .order("desc")
      .collect();

    // Look for the most recent event action that has eventOptions
    const activeEventAction = actions.find(action =>
      action.type === "event" &&
      action.eventOptions &&
      action.eventOptions.length > 0
    );

    if (!activeEventAction) {
      return null;
    }

    // Check if this event has been resolved by looking for a subsequent action
    // If there's any action after this event, consider it resolved
    const laterActions = actions.filter(action =>
      action.timestamp > activeEventAction.timestamp
    );

    if (laterActions.length > 0) {
      return null; // Event has been resolved
    }

    return {
      eventText: activeEventAction.content,
      eventOptions: activeEventAction.eventOptions,
      actionId: activeEventAction._id
    };
  },
});

export const createAdventureRecord = mutation({
  args: {
    title: v.string(),
    characterClass: v.union(v.literal("warrior"), v.literal("mage"), v.literal("rogue")),
    characterStats: v.object({
      hp: v.number(),
      mp: v.number(),
      str: v.number(),
      dex: v.number(),
      con: v.number(),
      int: v.number(),
      wis: v.number(),
      cha: v.number(),
    }),
    worldDescription: v.string(),
    characterPortraitId: v.optional(v.id("characterPortraits")),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);

    if (!user) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();

    const adventureId = await ctx.db.insert("adventures", {
      userId: user._id,
      title: args.title,
      characterClass: args.characterClass,
      characterStats: args.characterStats,
      currentStats: { ...args.characterStats }, // Start with same stats
      worldDescription: args.worldDescription,
      status: "active",
      lastPlayedAt: now,
      createdAt: now,
      turnCount: 0,
      characterPortraitId: args.characterPortraitId,
    });

    await ctx.db.insert("adventureActions", {
      adventureId,
      type: "world",
      content: args.worldDescription,
      timestamp: now,
      turnNumber: 0,
    });

    return adventureId;
  },
});

export const createAdventure = action({
  args: {
    playerClass: v.union(v.literal("warrior"), v.literal("mage"), v.literal("rogue")),
    stats: v.object({
      hp: v.number(),
      mp: v.number(),
      str: v.number(),
      dex: v.number(),
      con: v.number(),
      int: v.number(),
      wis: v.number(),
      cha: v.number(),
    }),
    characterPortraitId: v.optional(v.id("characterPortraits")),
  },
  handler: async (ctx, args): Promise<Id<"adventures">> => {
    // SECURITY: Validate point buy stats server-side to prevent cheating
    try {
      validatePointBuyStats({
        str: args.stats.str,
        dex: args.stats.dex,
        con: args.stats.con,
        int: args.stats.int,
        wis: args.stats.wis,
        cha: args.stats.cha,
      });

      validateDerivedStats(args.playerClass, {
        hp: args.stats.hp,
        mp: args.stats.mp,
        con: args.stats.con,
        int: args.stats.int,
        dex: args.stats.dex,
      });
    } catch (error) {
      console.error("Point buy validation failed:", error);
      throw new Error(`Invalid character stats: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    // Generate both world description and title in a single OpenAI call
    const systemPrompt = `You are a Dungeon Master. Create a fantasy adventure for a ${args.playerClass} character.

Generate a JSON response with:
1. "worldDescription": A rich but concise fantasy world setting and starting location (2-3 sentences)
2. "title": A short, exciting adventure title (2-4 words, epic and fantasy-themed)

Be creative and make the world compelling for a ${args.playerClass}.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      reasoning_effort: "minimal",
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "adventure_setup",
          schema: {
            type: "object",
            properties: {
              worldDescription: { type: "string" },
              title: { type: "string" }
            },
            required: ["worldDescription", "title"]
          }
        }
      },
      messages: [{ role: "system", content: systemPrompt }],
    });

    const response = completion.choices[0].message?.content;
    if (!response) {
      throw new Error("No response from AI");
    }

    let parsed: { title?: string; worldDescription?: string };
    try {
      parsed = JSON.parse(response);
    } catch (error) {
      console.error("Failed to parse AI response:", response);
      throw new Error("Invalid JSON response from AI");
    }

    const title = parsed.title || "Untitled Adventure";
    const worldDescription = parsed.worldDescription || "A mysterious land awaits.";

    // Create adventure in database using internal mutation
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();

    const adventureId = await ctx.runMutation(api.adventures.createAdventureRecord, {
      title,
      characterClass: args.playerClass,
      characterStats: args.stats,
      worldDescription,
      characterPortraitId: args.characterPortraitId,
    });

    return adventureId;
  },
});

export const addAdventureAction = mutation({
  args: {
    adventureId: v.id("adventures"),
    type: v.union(v.literal("action"), v.literal("result"), v.literal("roll"), v.literal("event")),
    content: v.string(),
    eventOptions: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const adventure = await ctx.db.get(args.adventureId);
    if (!adventure || adventure.userId !== user._id) {
      throw new Error("Adventure not found or access denied");
    }

    const now = Date.now();
    let newTurnCount = adventure.turnCount;

    if (args.type === "action") {
      newTurnCount += 1;
      await ctx.db.patch(args.adventureId, {
        turnCount: newTurnCount,
        lastPlayedAt: now,
      });
    }

    await ctx.db.insert("adventureActions", {
      adventureId: args.adventureId,
      type: args.type,
      content: args.content,
      timestamp: now,
      turnNumber: newTurnCount,
      eventOptions: args.eventOptions,
    });

    return newTurnCount;
  },
});

export const updateAdventureInventory = mutation({
  args: {
    adventureId: v.id("adventures"),
    inventoryChanges: v.array(v.object({
      name: v.string(),
      quantityChange: v.number(),
      description: v.optional(v.string()),
      reason: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const adventure = await ctx.db.get(args.adventureId);
    if (!adventure || adventure.userId !== user._id) {
      throw new Error("Adventure not found or access denied");
    }

    const currentInventory = await ctx.db
      .query("adventureInventory")
      .withIndex("by_adventure", (q) => q.eq("adventureId", args.adventureId))
      .collect();

    for (const change of args.inventoryChanges) {
      const existingItem = currentInventory.find(
        (item) => item.itemName.toLowerCase() === change.name.toLowerCase()
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + change.quantityChange;
        if (newQuantity <= 0) {
          await ctx.db.delete(existingItem._id);
        } else {
          await ctx.db.patch(existingItem._id, {
            quantity: newQuantity,
          });
        }
      } else if (change.quantityChange > 0) {
        await ctx.db.insert("adventureInventory", {
          adventureId: args.adventureId,
          itemName: change.name,
          quantity: change.quantityChange,
          description: change.description,
          reason: change.reason,
        });
      }
    }
  },
});

export const updateAdventureGlossary = mutation({
  args: {
    adventureId: v.id("adventures"),
    glossaryTerms: v.array(v.object({
      term: v.string(),
      definition: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const adventure = await ctx.db.get(args.adventureId);
    if (!adventure || adventure.userId !== user._id) {
      throw new Error("Adventure not found or access denied");
    }

    const existingTerms = await ctx.db
      .query("adventureGlossary")
      .withIndex("by_adventure", (q) => q.eq("adventureId", args.adventureId))
      .collect();

    const existingTermNames = existingTerms.map((t) => t.term.toLowerCase());

    for (const term of args.glossaryTerms) {
      if (!existingTermNames.includes(term.term.toLowerCase())) {
        await ctx.db.insert("adventureGlossary", {
          adventureId: args.adventureId,
          term: term.term,
          definition: term.definition,
        });
      }
    }
  },
});

export const updateAdventureStatus = mutation({
  args: {
    adventureId: v.id("adventures"),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("paused")),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const adventure = await ctx.db.get(args.adventureId);
    if (!adventure || adventure.userId !== user._id) {
      throw new Error("Adventure not found or access denied");
    }

    await ctx.db.patch(args.adventureId, {
      status: args.status,
      lastPlayedAt: Date.now(),
    });
  },
});

export const updateAdventureStats = mutation({
  args: {
    adventureId: v.id("adventures"),
    statToAdjust: v.union(
      v.literal("hp"),
      v.literal("mp"),
      v.literal("str"),
      v.literal("dex"),
      v.literal("con"),
      v.literal("int"),
      v.literal("wis"),
      v.literal("cha")
    ),
    adjustmentAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const adventure = await ctx.db.get(args.adventureId);
    if (!adventure || adventure.userId !== user._id) {
      throw new Error("Adventure not found or access denied");
    }

    const currentStats = { ...adventure.currentStats };
    currentStats[args.statToAdjust] = Math.max(0, currentStats[args.statToAdjust] + args.adjustmentAmount);

    // Cap HP and MP at their base values (don't allow overhealing beyond max)
    if (args.statToAdjust === "hp") {
      currentStats.hp = Math.min(currentStats.hp, adventure.characterStats.hp);
    } else if (args.statToAdjust === "mp") {
      currentStats.mp = Math.min(currentStats.mp, adventure.characterStats.mp);
    }

    await ctx.db.patch(args.adventureId, {
      currentStats,
    });

    return currentStats;
  },
});

export const deleteAdventure = mutation({
  args: {
    adventureId: v.id("adventures"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const adventure = await ctx.db.get(args.adventureId);
    if (!adventure || adventure.userId !== user._id) {
      throw new Error("Adventure not found or access denied");
    }

    await ctx.db.patch(args.adventureId, {
      deletedAt: Date.now(),
    });
  },
});

