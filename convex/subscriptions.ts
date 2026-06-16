import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

export type SubscriptionState =
  | "paid"
  | "trial_active"
  | "trial_expired"
  | "no_subscription";

export const getSubscriptionState = query({
  args: {},
  handler: async (ctx): Promise<{
    state: SubscriptionState;
    trialEndsAt?: number;
    currentPeriodEndsAt?: number;
    status?: string;
  }> => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return { state: "no_subscription" };

    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!sub) return { state: "no_subscription" };

    const s = String(sub.status).toLowerCase();
    const now = Date.now();

    if (s === "active") {
      return {
        state: "paid",
        currentPeriodEndsAt: sub.currentPeriodEndMs,
        status: sub.status,
      };
    }

    if (s === "trialing") {
      // If trialEndMs is missing or in the future → active trial
      if (!sub.trialEndMs || sub.trialEndMs > now) {
        return {
          state: "trial_active",
          trialEndsAt: sub.trialEndMs,
          status: sub.status,
        };
      }
      // trialEndMs is in the past → expired
      return {
        state: "trial_expired",
        trialEndsAt: sub.trialEndMs,
        status: sub.status,
      };
    }

    // canceled, past_due, etc.
    return {
      state: "trial_expired",
      trialEndsAt: sub.trialEndMs,
      status: sub.status,
    };
  },
});

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
    const s = String(sub.status).toLowerCase();
    return s === "trialing" || s === "active";
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
    const expected = process.env.POLAR_SYNC_SECRET?.trim();
    const received = args.secret?.trim();
    if (!expected) {
      throw new Error(
        "POLAR_SYNC_SECRET is not set on this Convex deployment. Add it in Dashboard → Settings → Environment Variables (use the same value as on Vercel)."
      );
    }
    if (received !== expected) {
      throw new Error(
        "POLAR_SYNC_SECRET mismatch: the value on Convex must exactly match POLAR_SYNC_SECRET on Vercel (and .env.local for dev)."
      );
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

    // Denormalize plan onto the user row so it's visible in the dashboard
    // without a join.
    const s = args.status.toLowerCase();
    const plan: "free" | "trialing" | "paid" =
      s === "active" ? "paid" : s === "trialing" ? "trialing" : "free";

    const user = await ctx.db.get(args.userId);
    if (user) {
      await ctx.db.patch(args.userId, { plan, planUpdatedAt: now });
    }
  },
});
