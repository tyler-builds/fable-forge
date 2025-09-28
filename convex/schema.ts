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
    deletedAt: v.optional(v.number()) // Soft delete timestamp
  }).index("by_user", ["userId"]).index("by_status", ["userId", "status"]),

  adventureActions: defineTable({
    adventureId: v.id("adventures"),
    type: v.union(v.literal("world"), v.literal("action"), v.literal("result"), v.literal("roll")),
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
});
