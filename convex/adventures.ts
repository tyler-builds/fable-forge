import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import OpenAI from "openai";

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

export const createAdventure = mutation({
  args: {
    title: v.string(),
    characterClass: v.union(v.literal("warrior"), v.literal("mage")),
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

export const addAdventureAction = mutation({
  args: {
    adventureId: v.id("adventures"),
    type: v.union(v.literal("action"), v.literal("result")),
    content: v.string(),
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

export const generateAdventureTitle = action({
  args: {
    characterClass: v.string(),
    worldDescription: v.string(),
  },
  handler: async (ctx, args) => {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        {
          role: "system",
          content: "Generate a short, exciting adventure title (2-4 words) based on the character class and world description. Make it sound epic and fantasy-themed.",
        },
        {
          role: "user",
          content: `Character: ${args.characterClass}, World: ${args.worldDescription}`,
        },
      ],
    });

    return completion.choices[0].message?.content || "Untitled Adventure";
  },
});