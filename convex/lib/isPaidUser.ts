import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Returns true if the user has paid access via either:
 *   1. An active/trialing Polar subscription row, OR
 *   2. A manually-set `plan: "paid"` on their user document
 *      (set directly in the Convex dashboard for gifted/comp access).
 */
export async function isPaidUser(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">
): Promise<boolean> {
  // Manual override: check users.plan first (fast, single doc read)
  const user = await ctx.db.get(userId);
  if (user?.plan === "paid" || user?.plan === "trialing") return true;

  // Polar subscription check
  const sub = await ctx.db
    .query("subscriptions")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();

  if (!sub) return false;
  const s = sub.status.toLowerCase();
  return s === "active" || s === "trialing";
}
