import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { authComponent } from "./auth";

// Query: Find background by scene hash
export const findBySceneHash = query({
  args: { sceneHash: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sceneBackgrounds")
      .withIndex("by_scene_hash", (q) => q.eq("sceneHash", args.sceneHash))
      .first();
  },
});

// Query: Get current adventure background
export const getCurrentBackground = query({
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

    if (!adventure.currentSceneHash) {
      return null;
    }

    return await ctx.db
      .query("sceneBackgrounds")
      .withIndex("by_scene_hash", (q) => q.eq("sceneHash", adventure.currentSceneHash!))
      .first();
  },
});

// Internal mutation: Create new background (called from scheduled actions)
export const createBackground = internalMutation({
  args: {
    sceneHash: v.string(),
    sceneKeywords: v.array(v.string()),
    sceneCategory: v.string(),
    imageStorageId: v.id("_storage"),
    imageUrl: v.string(),
    imagePrompt: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("sceneBackgrounds", {
      sceneHash: args.sceneHash,
      sceneKeywords: args.sceneKeywords,
      sceneCategory: args.sceneCategory,
      imageStorageId: args.imageStorageId,
      imageUrl: args.imageUrl,
      imagePrompt: args.imagePrompt,
      createdAt: now,
      usageCount: 1,
      lastUsedAt: now,
    });
  },
});

// Internal mutation: Update adventure's current scene (called from scheduled actions)
export const updateAdventureScene = internalMutation({
  args: {
    adventureId: v.id("adventures"),
    sceneHash: v.string(),
  },
  handler: async (ctx, args) => {
    const adventure = await ctx.db.get(args.adventureId);
    if (!adventure || adventure.deletedAt) {
      throw new Error("Adventure not found");
    }

    await ctx.db.patch(args.adventureId, {
      currentSceneHash: args.sceneHash,
    });
  },
});

// Internal mutation: Increment background usage (called from scheduled actions)
export const incrementUsage = internalMutation({
  args: { backgroundId: v.id("sceneBackgrounds") },
  handler: async (ctx, args) => {
    const background = await ctx.db.get(args.backgroundId);
    if (!background) {
      throw new Error("Background not found");
    }

    await ctx.db.patch(args.backgroundId, {
      usageCount: background.usageCount + 1,
      lastUsedAt: Date.now(),
    });
  },
});