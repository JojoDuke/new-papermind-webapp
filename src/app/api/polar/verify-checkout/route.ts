import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { getPolarServer } from "@/lib/polar-server";
import {
  syncPolarSubscriptionToConvex,
  type PolarSubscriptionPayload,
} from "@/lib/polar-sync";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/** Backup sync when returning from Polar before webhooks land. */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  convex.setAuth(token);

  let body: { checkoutId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const checkoutId = body.checkoutId?.trim();
  if (!checkoutId) {
    return NextResponse.json({ error: "Missing checkoutId" }, { status: 400 });
  }

  const user = await convex.query(api.auth.currentUser);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const polar = getPolarServer();
  const checkout = await polar.checkouts.get({ id: checkoutId });

  const metaUid = checkout.metadata?.convexUserId;
  if (metaUid != null && String(metaUid) !== user._id) {
    return NextResponse.json(
      { error: "Checkout does not belong to this user" },
      { status: 403 }
    );
  }

  if (checkout.status !== "succeeded") {
    return NextResponse.json({ ok: false, reason: "checkout_not_complete" });
  }

  const iter = await polar.subscriptions.list({
    externalCustomerId: user._id,
  });

  for await (const page of iter) {
    for (const sub of page.result.items) {
      await syncPolarSubscriptionToConvex(
        sub as unknown as PolarSubscriptionPayload,
        user._id
      );
      return NextResponse.json({ ok: true });
    }
  }

  return NextResponse.json({ ok: false, reason: "no_subscription_yet" });
}

export const runtime = "nodejs";
