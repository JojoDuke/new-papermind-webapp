import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

export const getMySubscription = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const hasPaidAccess = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return false;
    }
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!sub) {
      return false;
    }
    return sub.status === "trialing" || sub.status === "active";
  },
});

export const syncFromPolar = mutation({
  args: {
    secret: v.string(),
    userId: v.id("users"),
    polarCustomerId: v.string(),
    polarSubscriptionId: v.string(),
    status: v.string(),
    trialEndMs: v.optional(v.number()),
    currentPeriodEndMs: v.optional(v.number()),
    priceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.secret !== process.env.POLAR_SYNC_SECRET) {
      throw new Error("Unauthorized");
    }
    const now = Date.now();
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    const row = {
      userId: args.userId,
      polarCustomerId: args.polarCustomerId,
      polarSubscriptionId: args.polarSubscriptionId,
      status: args.status,
      trialEndMs: args.trialEndMs,
      currentPeriodEndMs: args.currentPeriodEndMs,
      priceId: args.priceId,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, row);
    } else {
      await ctx.db.insert("subscriptions", row);
    }
  },
});
