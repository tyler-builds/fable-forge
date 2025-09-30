import { v } from "convex/values";
import { query } from "./_generated/server";

// Query: Get random portrait for a character class
export const getRandomPortrait = query({
  args: {
    characterClass: v.union(v.literal("warrior"), v.literal("mage"), v.literal("rogue"))
  },
  handler: async (ctx, args) => {
    const portraits = await ctx.db
      .query("characterPortraits")
      .withIndex("by_class", (q) => q.eq("characterClass", args.characterClass))
      .collect();

    if (portraits.length === 0) {
      return null;
    }

    // Return a random portrait with URL generated from storage
    const randomIndex = Math.floor(Math.random() * portraits.length);
    const portrait = portraits[randomIndex];
    const imageUrl = await ctx.storage.getUrl(portrait.imageStorageId);

    console.log("getRandomPortrait - storageId:", portrait.imageStorageId, "url:", imageUrl);

    return {
      _id: portrait._id,
      characterClass: portrait.characterClass,
      imageStorageId: portrait.imageStorageId,
      portraitIndex: portrait.portraitIndex,
      imageUrl: imageUrl ?? undefined,
    };
  },
});

// Query: Get specific portrait by ID
export const getPortraitById = query({
  args: { portraitId: v.id("characterPortraits") },
  handler: async (ctx, args) => {
    console.log("getPortraitById - portraitId:", args.portraitId);
    const portrait = await ctx.db.get(args.portraitId);
    if (!portrait) {
      console.log("getPortraitById - no portrait found");
      return null;
    }

    // Generate URL from storage
    const imageUrl = await ctx.storage.getUrl(portrait.imageStorageId);

    console.log("getPortraitById - storageId:", portrait.imageStorageId, "url:", imageUrl);

    return {
      _id: portrait._id,
      characterClass: portrait.characterClass,
      imageStorageId: portrait.imageStorageId,
      portraitIndex: portrait.portraitIndex,
      imageUrl: imageUrl ?? undefined,
    };
  },
});