import { internalMutation } from "../_generated/server";

export default internalMutation({
  handler: async (ctx) => {
    const adventures = await ctx.db.query("adventures").collect();

    let updatedCount = 0;

    for (const adventure of adventures) {
      // Only update if the fields don't exist
      await ctx.db.patch(adventure._id, {
        level: 1,
        currentXP: 0,
      });
      updatedCount++;
    }

    console.log(`Migration complete: Updated ${updatedCount} adventures with level and currentXP fields`);
    return { updatedCount };
  },
});
