import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { TRIAL_DAYS, type BillingPlan } from "@/lib/billing";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(key);
}

function appOrigin(req: NextRequest): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }
  return req.nextUrl.origin;
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  convex.setAuth(token);

  let body: { plan?: BillingPlan };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const plan: BillingPlan = body.plan === "starter" ? "starter" : "pro";
  const priceId =
    plan === "pro"
      ? process.env.STRIPE_PRICE_PRO
      : process.env.STRIPE_PRICE_STARTER;

  if (!priceId) {
    return NextResponse.json(
      { error: "Stripe price IDs are not configured on the server." },
      { status: 503 }
    );
  }

  const user = await convex.query(api.auth.currentUser);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripe = getStripe();
  const origin = appOrigin(req);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout?canceled=1`,
    client_reference_id: user._id,
    customer_email: user.email ?? undefined,
    metadata: {
      convexUserId: user._id,
    },
    subscription_data: {
      trial_period_days: TRIAL_DAYS,
      metadata: {
        convexUserId: user._id,
      },
    },
    payment_method_collection: "always",
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Could not create checkout session" },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: session.url });
}

export const runtime = "nodejs";
