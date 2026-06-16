import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * One-time backfill: set plan = "free" on every user that doesn't have a plan yet.
 * Run once via: npx convex run migrations:backfillUserPlans
 */
export const backfillUserPlans = internalMutation({
  args: {},
  returns: v.object({ patched: v.number(), skipped: v.number() }),
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    let patched = 0;
    let skipped = 0;

    for (const user of users) {
      if (user.plan !== undefined) {
        skipped++;
        continue;
      }
      await ctx.db.patch(user._id, { plan: "free", planUpdatedAt: Date.now() });
      patched++;
    }

    console.log(`backfillUserPlans: patched=${patched}, skipped=${skipped}`);
    return { patched, skipped };
  },
});
