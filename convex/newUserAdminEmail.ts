import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  mutation,
} from "./_generated/server";
import { buildNewUserTelegramMessage } from "./lib/newUserNotifyMessage";
import { sendTelegramMessage } from "./lib/telegram";

/** From OAuth redirect + page load, max age for "this counts as a new signup" */
const MAX_USER_AGE_MS = 30 * 60 * 1000;

/** Called from the app after sign-in (see `AdminNewUserNotify`). */
export const notifyAdminIfNew = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { ok: "skipped" as const, reason: "unauthenticated" };
    }

    const existing = await ctx.db
      .query("newUserAdminNotified")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (existing !== null) {
      return { ok: "skipped" as const, reason: "already_notified" };
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return { ok: "skipped" as const, reason: "no_user" };
    }

    const createdAt = (user as { _creationTime: number })._creationTime;
    const ageMs = Date.now() - createdAt;
    if (ageMs > MAX_USER_AGE_MS) {
      return { ok: "skipped" as const, reason: "user_too_old" };
    }

    await ctx.db.insert("newUserAdminNotified", { userId });
    const u = user as { name?: string | null; email?: string | null };
    const displayName = u?.name?.trim() || u?.email?.trim() || "Someone";
    const userEmail = u?.email?.trim() || undefined;

    await ctx.scheduler.runAfter(0, internal.newUserAdminEmail.send, {
      userId,
      displayName,
      userEmail,
    });
    return { ok: "scheduled" as const, userId };
  },
});

/** Call if the Telegram request failed so a later sign-in can retry. */
export const clearNotified = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const row = await ctx.db
      .query("newUserAdminNotified")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (row !== null) {
      await ctx.db.delete(row._id);
    }
  },
});

/**
 * Telegram new-user alert. Env in Convex: TELEGRAM_BOT_TOKEN, NEW_USER_TELEGRAM_CHAT_ID
 */
export const send = internalAction({
  args: {
    userId: v.id("users"),
    displayName: v.string(),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, { userId, displayName, userEmail }) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.NEW_USER_TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      await ctx.runMutation(internal.newUserAdminEmail.clearNotified, {
        userId,
      });
      return;
    }

    const text = buildNewUserTelegramMessage({
      displayName,
      userEmail,
    });

    try {
      await sendTelegramMessage(botToken, chatId, text);
    } catch (e) {
      await ctx.runMutation(internal.newUserAdminEmail.clearNotified, {
        userId,
      });
      throw e;
    }
  },
});
