import { v } from "convex/values";
import { mutation, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

function assertDevPurgeSecret(secret: string) {
  const expected = process.env.DEV_PURGE_SECRET?.trim();
  if (!expected) {
    throw new Error(
      "DEV_PURGE_SECRET is not set on this Convex deployment. Add it in the dashboard or .env.local for dev.",
    );
  }
  if (secret.trim() !== expected) {
    throw new Error("Invalid purge secret.");
  }
}

async function findUserByEmail(ctx: MutationCtx, email: string) {
  const normalized = email.trim().toLowerCase();
  const exact = await ctx.db
    .query("users")
    .withIndex("email", (q) => q.eq("email", email.trim()))
    .first();
  if (exact) return exact;

  const lower = await ctx.db
    .query("users")
    .withIndex("email", (q) => q.eq("email", normalized))
    .first();
  if (lower) return lower;

  const all = await ctx.db.query("users").collect();
  return (
    all.find((u) => (u.email ?? "").trim().toLowerCase() === normalized) ?? null
  );
}

async function purgeUserData(ctx: MutationCtx, userId: Id<"users">) {
  const deleted: Record<string, number> = {};
  const bump = (key: string, n = 1) => {
    deleted[key] = (deleted[key] ?? 0) + n;
  };

  for (const row of await ctx.db
    .query("flashcardDeckProgress")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect()) {
    await ctx.db.delete(row._id);
    bump("flashcardDeckProgress");
  }

  for (const row of await ctx.db
    .query("quizDeckProgress")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect()) {
    await ctx.db.delete(row._id);
    bump("quizDeckProgress");
  }

  for (const deck of await ctx.db
    .query("flashcardDecks")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect()) {
    for (const card of await ctx.db
      .query("flashcards")
      .withIndex("by_deck", (q) => q.eq("deckId", deck._id))
      .collect()) {
      await ctx.db.delete(card._id);
      bump("flashcards");
    }
    await ctx.db.delete(deck._id);
    bump("flashcardDecks");
  }

  for (const deck of await ctx.db
    .query("quizDecks")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect()) {
    for (const question of await ctx.db
      .query("quizQuestions")
      .withIndex("by_deck", (q) => q.eq("deckId", deck._id))
      .collect()) {
      await ctx.db.delete(question._id);
      bump("quizQuestions");
    }
    await ctx.db.delete(deck._id);
    bump("quizDecks");
  }

  for (const guide of await ctx.db
    .query("studyGuides")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect()) {
    await ctx.db.delete(guide._id);
    bump("studyGuides");
  }

  for (const doc of await ctx.db
    .query("documents")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect()) {
    await ctx.storage.delete(doc.storageId);
    await ctx.db.delete(doc._id);
    bump("documents");
  }

  for (const sub of await ctx.db
    .query("subscriptions")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect()) {
    await ctx.db.delete(sub._id);
    bump("subscriptions");
  }

  for (const row of await ctx.db
    .query("newUserAdminNotified")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect()) {
    await ctx.db.delete(row._id);
    bump("newUserAdminNotified");
  }

  const accounts = await ctx.db
    .query("authAccounts")
    .filter((q) => q.eq(q.field("userId"), userId))
    .collect();

  const sessions = await ctx.db
    .query("authSessions")
    .withIndex("userId", (q) => q.eq("userId", userId))
    .collect();

  for (const session of sessions) {
    for (const token of await ctx.db
      .query("authRefreshTokens")
      .withIndex("sessionId", (q) => q.eq("sessionId", session._id))
      .collect()) {
      await ctx.db.delete(token._id);
      bump("authRefreshTokens");
    }

    for (const verifier of await ctx.db
      .query("authVerifiers")
      .filter((q) => q.eq(q.field("sessionId"), session._id))
      .collect()) {
      await ctx.db.delete(verifier._id);
      bump("authVerifiers");
    }

    await ctx.db.delete(session._id);
    bump("authSessions");
  }

  for (const account of accounts) {
    for (const code of await ctx.db
      .query("authVerificationCodes")
      .withIndex("accountId", (q) => q.eq("accountId", account._id))
      .collect()) {
      await ctx.db.delete(code._id);
      bump("authVerificationCodes");
    }
    await ctx.db.delete(account._id);
    bump("authAccounts");
  }

  const user = await ctx.db.get(userId);
  const emailKey = (user?.email ?? "").trim().toLowerCase();
  if (emailKey) {
    for (const limit of await ctx.db
      .query("authRateLimits")
      .withIndex("identifier", (q) => q.eq("identifier", emailKey))
      .collect()) {
      await ctx.db.delete(limit._id);
      bump("authRateLimits");
    }
    for (const limit of await ctx.db
      .query("authRateLimits")
      .withIndex("identifier", (q) => q.eq("identifier", user?.email ?? ""))
      .collect()) {
      await ctx.db.delete(limit._id);
      bump("authRateLimits");
    }
  }

  await ctx.db.delete(userId);
  bump("users");

  return deleted;
}

/**
 * Dev-only: wipe all Convex data + auth + file storage for a user by email.
 * Requires DEV_PURGE_SECRET on the deployment.
 *
 * CLI: npm run purge:user -- you@example.com
 */
export const purgeUserByEmail = mutation({
  args: {
    email: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, { email, secret }) => {
    assertDevPurgeSecret(secret);

    const user = await findUserByEmail(ctx, email);
    if (!user) {
      return {
        ok: false as const,
        reason: "user_not_found" as const,
        email: email.trim(),
      };
    }

    const deleted = await purgeUserData(ctx, user._id);

    return {
      ok: true as const,
      email: user.email ?? email.trim(),
      userId: user._id,
      deleted,
      note:
        "Polar customer/subscription is unchanged. Cancel or delete the customer in Polar sandbox to retest billing.",
    };
  },
});
