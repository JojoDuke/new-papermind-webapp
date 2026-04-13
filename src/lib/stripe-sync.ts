import type Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;

export async function syncStripeSubscriptionToConvex(
  stripeSub: Stripe.Subscription,
  convexUserId: string
) {
  const secret = process.env.STRIPE_SYNC_SECRET;
  if (!secret) {
    throw new Error("STRIPE_SYNC_SECRET is not configured");
  }

  const customerId =
    typeof stripeSub.customer === "string"
      ? stripeSub.customer
      : stripeSub.customer.id;

  const trialEndMs = stripeSub.trial_end ? stripeSub.trial_end * 1000 : undefined;
  const currentPeriodEndMs = stripeSub.current_period_end * 1000;
  const priceId = stripeSub.items.data[0]?.price?.id;

  const convex = new ConvexHttpClient(convexUrl);
  await convex.mutation(api.subscriptions.syncFromStripe, {
    secret,
    userId: convexUserId as Id<"users">,
    stripeCustomerId: customerId,
    stripeSubscriptionId: stripeSub.id,
    status: stripeSub.status,
    trialEndMs,
    currentPeriodEndMs,
    priceId,
  });
}
