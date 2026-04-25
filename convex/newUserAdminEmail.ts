import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  mutation,
} from "./_generated/server";

/** From OAuth redirect + page load, max age for "this counts as a new signup" */
const MAX_USER_AGE_MS = 30 * 60 * 1000;

const RESEND_API = "https://api.resend.com/emails";

/**
 * Called once from the app after sign-in. Shows up in Convex logs as
 * `newUserAdminEmail:notifyAdminIfNew` (unlike the auth callback, which is nested inside
 * `auth:store` and is easy to never see in search).
 */
export const notifyAdminIfNew = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      console.log("[newUserSignUp] notifyAdminIfNew: not signed in, skip");
      return { ok: "skipped" as const, reason: "unauthenticated" };
    }

    const existing = await ctx.db
      .query("newUserAdminNotified")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (existing !== null) {
      console.log("[newUserSignUp] notifyAdminIfNew: already notified", { userId });
      return { ok: "skipped" as const, reason: "already_notified" };
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      console.log("[newUserSignUp] notifyAdminIfNew: no user row", { userId });
      return { ok: "skipped" as const, reason: "no_user" };
    }

    const createdAt = (user as { _creationTime: number })._creationTime;
    const ageMs = Date.now() - createdAt;
    if (ageMs > MAX_USER_AGE_MS) {
      console.log("[newUserSignUp] notifyAdminIfNew: user too old (not a fresh signup)", {
        userId,
        ageMs,
      });
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
    console.log("[newUserSignUp] notifyAdminIfNew: scheduled send", {
      userId,
      displayName,
      hasUserEmail: Boolean(userEmail),
      ageMs,
    });
    return { ok: "scheduled" as const, userId };
  },
});

/** Call if the Resend request failed so a later sign-in can retry the email. */
export const clearNotified = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const row = await ctx.db
      .query("newUserAdminNotified")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (row !== null) {
      await ctx.db.delete(row._id);
      console.log("[newUserSignUp] cleared newUserAdminNotified (retry or failure)", {
        userId,
        rowId: row._id,
      });
    }
  },
});

/**
 * Called from the auth callback after inserting newUserAdminNotified.
 * Set in the Convex dashboard: RESEND_API_KEY, NEW_USER_NOTIFY_TO, optional RESEND_FROM
 */
export const send = internalAction({
  args: {
    userId: v.id("users"),
    displayName: v.string(),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, { userId, displayName, userEmail }) => {
    console.log("[newUserSignUp] send action started", {
      userId,
      displayName,
      hasUserEmail: Boolean(userEmail),
    });

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.NEW_USER_NOTIFY_TO;
    const from =
      process.env.RESEND_FROM ?? "Papermind <hello@usepapermind.app>";

    if (!apiKey || !to) {
      console.error("[newUserSignUp] missing Convex env; cannot send", {
        userId,
        hasResendApiKey: Boolean(apiKey),
        hasNewUserNotifyTo: Boolean(to),
      });
      await ctx.runMutation(internal.newUserAdminEmail.clearNotified, {
        userId,
      });
      return;
    }

    console.log("[newUserSignUp] calling Resend API", {
      userId,
      from,
      notifyToDomain: to.includes("@") ? to.split("@")[1] : "(invalid)",
    });

    const subject = "New Papermind signup";
    const text = `A new user (${displayName}) just signed up to Papermind!${
      userEmail ? `\n\nEmail: ${userEmail}` : ""
    }\n\nUser id: ${userId}`;

    try {
      const res = await fetch(RESEND_API, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject,
          text,
          html: `<p><strong>A new user (${escapeHtml(displayName)}) just signed up to Papermind!</strong></p>${
            userEmail
              ? `<p>Email: <a href="mailto:${escapeHtml(userEmail)}">${escapeHtml(
                  userEmail,
                )}</a></p>`
              : ""
          }<p style="color:#6b7280;font-size:12px;">User id: ${escapeHtml(
            userId,
          )}</p>`,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.error("[newUserSignUp] Resend HTTP error", {
          userId,
          status: res.status,
          body: errBody.slice(0, 500),
        });
        throw new Error(`Resend failed: ${res.status} ${errBody}`);
      }

      const created = (await res.json()) as { id?: string };
      console.log("[newUserSignUp] Resend accepted email", {
        userId,
        resendId: created.id,
      });
    } catch (e) {
      console.error("[newUserSignUp] send failed, clearing claim row for retry", {
        userId,
        error: e instanceof Error ? e.message : String(e),
      });
      await ctx.runMutation(internal.newUserAdminEmail.clearNotified, {
        userId,
      });
      throw e;
    }
  },
});

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
