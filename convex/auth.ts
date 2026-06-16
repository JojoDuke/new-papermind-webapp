import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import Google from "@auth/core/providers/google";
import { query } from "./_generated/server";
import { ResendOTPPasswordReset } from "./ResendPasswordReset";
import { resolveAuthRedirect } from "./lib/authRedirect";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({ reset: ResendOTPPasswordReset }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    redirect: resolveAuthRedirect,
    async afterUserCreatedOrUpdated(ctx, { userId, existingUserId }) {
      // Only run for brand-new users (existingUserId is null on first signup).
      if (existingUserId !== null) return;
      const user = await ctx.db.get(userId);
      if (user && user.plan === undefined) {
        await ctx.db.patch(userId, { plan: "free", planUpdatedAt: Date.now() });
      }
    },
  },
  // New-user admin Telegram alert: see `newUserAdminEmail.notifyAdminIfNew` (triggered from the
  // client so it always appears as its own function in Convex logs; the auth
  // `afterUserCreatedOrUpdated` path is easy to miss or omit from production bundles.)
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