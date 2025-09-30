"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import OpenAI from "openai";
import { createSceneHash, getSceneCategory, extractSceneKeywords, generateImagePrompt } from "./sceneUtils";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Action: Handle scene change detection
export const handleSceneChange = action({
  args: {
    adventureId: v.id("adventures"),
    sceneDescription: v.string(),
  },
  handler: async (ctx, args) => {
    console.time("handleSceneChange");

    const sceneHash = createSceneHash(args.sceneDescription);
    const sceneCategory = getSceneCategory(args.sceneDescription);

    console.log(`Scene change detected: ${args.sceneDescription} -> ${sceneCategory} (${sceneHash})`);

    // Check if we already have a background for this scene
    const existingBackground = await ctx.runQuery(api.backgroundMutations.findBySceneHash, {
      sceneHash,
    });

    if (existingBackground) {
      console.log("Reusing existing background");
      // Update adventure's current scene
      await ctx.runMutation(api.backgroundMutations.updateAdventureScene, {
        adventureId: args.adventureId,
        sceneHash,
      });

      // Track usage
      await ctx.runMutation(api.backgroundMutations.incrementUsage, {
        backgroundId: existingBackground._id,
      });
    } else {
      console.log("Generating new background");
      // Generate new background
      await generateNewBackground(ctx, args.adventureId, args.sceneDescription, sceneHash, sceneCategory);
    }

    console.timeEnd("handleSceneChange");
    return { sceneHash, sceneCategory };
  },
});

// Helper function to generate new background
async function generateNewBackground(
  ctx: any,
  adventureId: string,
  sceneDescription: string,
  sceneHash: string,
  sceneCategory: string
) {
  console.time("generateNewBackground");

  try {
    const imagePrompt = generateImagePrompt(sceneCategory, sceneDescription);
    console.log("Generated prompt:", imagePrompt);

    console.time("image_generation");
    const imageResponse = await openai.images.generate({
      model: "gpt-image-1",
      prompt: imagePrompt,
      size: "1536x1024",
      quality: "medium",
    });
    console.timeEnd("image_generation");

    const base64Image = imageResponse.data?.[0]?.b64_json;
    if (!base64Image) {
      throw new Error("No base64 image returned");
    }

    // Convert base64 to blob and store in Convex
    console.time("image_storage");
    const imageBuffer = Buffer.from(base64Image, 'base64');
    const imageBlob = new Blob([imageBuffer], { type: 'image/png' });
    const imageStorageId = await ctx.storage.store(imageBlob);
    const convexImageUrl = await ctx.storage.getUrl(imageStorageId);
    console.timeEnd("image_storage");

    // Save background to database
    const backgroundId = await ctx.runMutation(api.backgroundMutations.createBackground, {
      sceneHash,
      sceneKeywords: extractSceneKeywords(sceneDescription),
      sceneCategory,
      imageStorageId,
      imageUrl: convexImageUrl!,
      imagePrompt,
    });

    // Update adventure's current scene
    await ctx.runMutation(api.backgroundMutations.updateAdventureScene, {
      adventureId,
      sceneHash,
    });

    console.log("Successfully generated and stored new background");
    console.timeEnd("generateNewBackground");

    return backgroundId;
  } catch (error) {
    console.error("Failed to generate background:", error);
    console.timeEnd("generateNewBackground");
    throw error;
  }
}