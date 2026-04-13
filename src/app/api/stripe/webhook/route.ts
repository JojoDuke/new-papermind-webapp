import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { syncStripeSubscriptionToConvex } from "@/lib/stripe-sync";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(key);
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe webhook] STRIPE_WEBHOOK_SECRET missing");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[stripe webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") {
          break;
        }
        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        if (!subId) {
          break;
        }
        const userId =
          session.metadata?.convexUserId ?? session.client_reference_id;
        if (!userId) {
          console.error("[stripe webhook] checkout.session.completed missing convexUserId");
          break;
        }
        const sub = await stripe.subscriptions.retrieve(subId);
        await syncStripeSubscriptionToConvex(sub, userId);
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const stripeSub = event.data.object as Stripe.Subscription;
        const userId = stripeSub.metadata?.convexUserId;
        if (!userId) {
          console.warn("[stripe webhook] subscription event missing convexUserId metadata");
          break;
        }
        await syncStripeSubscriptionToConvex(stripeSub, userId);
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error("[stripe webhook] handler error:", e);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

export const runtime = "nodejs";
