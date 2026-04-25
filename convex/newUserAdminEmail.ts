import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, internalMutation } from "./_generated/server";

const RESEND_API = "https://api.resend.com/emails";

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
    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.NEW_USER_NOTIFY_TO;
    const from =
      process.env.RESEND_FROM ?? "Papermind <hello@usepapermind.app>";

    if (!apiKey || !to) {
      console.error(
        "[newUserAdminEmail] Missing RESEND_API_KEY or NEW_USER_NOTIFY_TO; skipping admin notification for user",
        userId,
      );
      await ctx.runMutation(internal.newUserAdminEmail.clearNotified, {
        userId,
      });
      return;
    }

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
        throw new Error(`Resend failed: ${res.status} ${errBody}`);
      }
    } catch (e) {
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
