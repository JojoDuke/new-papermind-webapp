import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import Google from "@auth/core/providers/google";
import { query, type MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password,
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, { userId }) {
      // Convex Auth types `ctx` with auth tables only; we need our full schema for app tables.
      const m = ctx as MutationCtx;
      const existing = await m.db
        .query("newUserAdminNotified")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique();
      if (existing !== null) {
        return;
      }

      await m.db.insert("newUserAdminNotified", { userId });

      const user = await m.db.get(userId);
      const u = user as { name?: string | null; email?: string | null } | null;
      const displayName = u?.name?.trim() || u?.email?.trim() || "Someone";
      const userEmail = u?.email?.trim() || undefined;

      await ctx.scheduler.runAfter(0, internal.newUserAdminEmail.send, {
        userId,
        displayName,
        userEmail,
      });
    },
  },
});

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (userId === null) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});