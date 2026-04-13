import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { syncStripeSubscriptionToConvex } from "@/lib/stripe-sync";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(key);
}

/** Backup sync when the user returns from Checkout before the webhook runs. */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  convex.setAuth(token);

  let body: { sessionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const sessionId = body.sessionId?.trim();
  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const user = await convex.query(api.auth.currentUser);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });

  const metaUser =
    session.metadata?.convexUserId ?? session.client_reference_id;
  if (metaUser !== user._id) {
    return NextResponse.json({ error: "Session does not belong to this user" }, { status: 403 });
  }

  if (session.mode !== "subscription" || session.status !== "complete") {
    return NextResponse.json({ ok: false, reason: "not_completed" });
  }
  const paymentOk =
    session.payment_status === "paid" ||
    session.payment_status === "no_payment_required";
  if (!paymentOk) {
    return NextResponse.json({ ok: false, reason: "payment_pending" });
  }

  const subRaw = session.subscription;
  const subId = typeof subRaw === "string" ? subRaw : subRaw?.id;
  if (!subId) {
    return NextResponse.json({ ok: false, reason: "no_subscription" });
  }

  const sub = await stripe.subscriptions.retrieve(subId);
  await syncStripeSubscriptionToConvex(sub, user._id);

  return NextResponse.json({ ok: true });
}

export const runtime = "nodejs";
