import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import {
  DEFAULT_BILLING_PLAN,
  TRIAL_DAYS,
  type BillingInterval,
} from "@/lib/billing";
import { getPolarServer } from "@/lib/polar-server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function appOrigin(req: NextRequest): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }
  return req.nextUrl.origin;
}

/**
 * Polar product UUIDs from the dashboard (Products → copy ID).
 * Primary names: POLAR_PAPERMIND_*_PRODUCT_ID — falls back to POLAR_PRODUCT_* for older setups.
 */
function resolvePolarProductId(interval: BillingInterval): string | undefined {
  if (interval === "yearly") {
    return (
      process.env.POLAR_PAPERMIND_STARTER_YEARLY_PRODUCT_ID ??
      process.env.POLAR_PRODUCT_STARTER_YEARLY ??
      process.env.POLAR_PRODUCT_STARTER
    );
  }
  return (
    process.env.POLAR_PAPERMIND_STARTER_MONTHLY_PRODUCT_ID ??
    process.env.POLAR_PRODUCT_STARTER_MONTHLY ??
    process.env.POLAR_PRODUCT_STARTER
  );
}

function errorMessageFromUnknown(e: unknown): string {
  if (e instanceof Error) {
    return e.message;
  }
  if (typeof e === "object" && e !== null && "body" in e) {
    try {
      return JSON.stringify((e as { body: unknown }).body);
    } catch {
      /* fall through */
    }
  }
  return String(e);
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    convex.setAuth(token);

    let body: { interval?: BillingInterval };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const plan = DEFAULT_BILLING_PLAN;
    const interval: BillingInterval =
      body.interval === "yearly" ? "yearly" : "monthly";

    const productId = resolvePolarProductId(interval);

    if (!productId) {
      const hint =
        interval === "yearly"
          ? "Set POLAR_PAPERMIND_STARTER_YEARLY_PRODUCT_ID (or POLAR_PRODUCT_STARTER_YEARLY / POLAR_PRODUCT_STARTER)"
          : "Set POLAR_PAPERMIND_STARTER_MONTHLY_PRODUCT_ID (or POLAR_PRODUCT_STARTER_MONTHLY / POLAR_PRODUCT_STARTER)";
      return NextResponse.json(
        { error: `Polar product ID missing (${interval}). ${hint}` },
        { status: 503 }
      );
    }

    const user = await convex.query(api.auth.currentUser);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const polar = getPolarServer();
    const origin = appOrigin(req);

    const checkout = await polar.checkouts.create({
      products: [productId],
      successUrl: `${origin}/checkout/success?checkout_id={CHECKOUT_ID}`,
      returnUrl: `${origin}/checkout?canceled=1&interval=${interval}`,
      embedOrigin: origin,
      externalCustomerId: user._id,
      customerEmail: user.email ?? undefined,
      customerName: user.name ?? undefined,
      metadata: {
        convexUserId: user._id,
        billingPlan: plan,
        billingInterval: interval,
      },
      trialInterval: "day",
      trialIntervalCount: TRIAL_DAYS,
      allowTrial: true,
    });

    if (!checkout.url) {
      return NextResponse.json(
        { error: "Polar did not return a checkout URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: checkout.url });
  } catch (e: unknown) {
    console.error("[polar/checkout]", e);
    const msg = errorMessageFromUnknown(e);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

export const runtime = "nodejs";
