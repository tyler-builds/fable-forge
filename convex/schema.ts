import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  adventures: defineTable({
    userId: v.string(), // Links to Better Auth user table
    title: v.string(), // Auto-generated or user-defined
    characterClass: v.union(v.literal("warrior"), v.literal("mage")),
    characterStats: v.object({
      hp: v.number(),
      mp: v.number(),
      str: v.number(),
      dex: v.number(),
      con: v.number(),
      int: v.number(),
      wis: v.number(),
      cha: v.number()
    }),
    currentStats: v.object({
      hp: v.number(),
      mp: v.number(),
      str: v.number(),
      dex: v.number(),
      con: v.number(),
      int: v.number(),
      wis: v.number(),
      cha: v.number()
    }),
    worldDescription: v.string(),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("paused")),
    lastPlayedAt: v.number(),
    createdAt: v.number(),
    turnCount: v.number(),
    summary: v.optional(v.string()), // AI-generated adventure summary
    deletedAt: v.optional(v.number()), // Soft delete timestamp
    currentSceneHash: v.optional(v.string()), // Current scene for background tracking
    characterPortraitId: v.optional(v.id("characterPortraits")), // Character portrait image
  }).index("by_user", ["userId"]).index("by_status", ["userId", "status"]),

  adventureActions: defineTable({
    adventureId: v.id("adventures"),
    type: v.union(v.literal("world"), v.literal("action"), v.literal("result"), v.literal("roll"), v.literal("event")),
    content: v.string(),
    timestamp: v.number(),
    turnNumber: v.number(),
    eventOptions: v.optional(v.array(v.string()))
  }).index("by_adventure", ["adventureId"]).index("by_adventure_turn", ["adventureId", "turnNumber"]),

  adventureInventory: defineTable({
    adventureId: v.id("adventures"),
    itemName: v.string(),
    quantity: v.number(),
    description: v.optional(v.string()),
    reason: v.optional(v.string())
  }).index("by_adventure", ["adventureId"]),

  adventureGlossary: defineTable({
    adventureId: v.id("adventures"),
    term: v.string(),
    definition: v.string()
  }).index("by_adventure", ["adventureId"]),

  sceneBackgrounds: defineTable({
    sceneHash: v.string(), // Hash of normalized scene keywords
    sceneKeywords: v.array(v.string()), // Normalized keywords for debugging
    sceneCategory: v.string(), // Semantic category (e.g., "forest_outdoor_dark")
    imageStorageId: v.id("_storage"), // Convex file storage ID
    imageUrl: v.string(), // Public URL for the image
    imagePrompt: v.string(), // image generation prompt used
    createdAt: v.number(),
    usageCount: v.number(), // Track reuse across all adventures
    lastUsedAt: v.number()
  }).index("by_scene_hash", ["sceneHash"])
    .index("by_category", ["sceneCategory"])
    .index("by_usage", ["usageCount"])
    .index("by_last_used", ["lastUsedAt"]),

  characterPortraits: defineTable({
    characterClass: v.union(v.literal("warrior"), v.literal("mage"), v.literal("rogue")),
    imageStorageId: v.id("_storage"), // Convex file storage ID
    portraitIndex: v.number(), // 1-10 for each class
  }).index("by_class", ["characterClass"]),
});
