import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { getPolarServer } from "@/lib/polar-server";
import {
  syncPolarSubscriptionToConvex,
  type PolarSubscriptionPayload,
} from "@/lib/polar-sync";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function polarErrorDetail(e: unknown): string {
  if (e instanceof Error) return e.message;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

/** Backup sync when returning from Polar before webhooks land. */
export async function POST(req: NextRequest) {
  try {
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

    let polar;
    try {
      polar = getPolarServer();
    } catch (e) {
      console.error("[polar/verify-checkout] Polar client", e);
      return NextResponse.json(
        {
          error: "Server misconfiguration",
          detail: polarErrorDetail(e),
        },
        { status: 503 }
      );
    }

    let checkout;
    try {
      checkout = await polar.checkouts.get({ id: checkoutId });
    } catch (e) {
      console.error("[polar/verify-checkout] checkouts.get", e);
      return NextResponse.json(
        {
          error: "Polar rejected checkout lookup",
          detail: polarErrorDetail(e),
        },
        { status: 502 }
      );
    }

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

    if (checkout.subscriptionId) {
      try {
        const sub = await polar.subscriptions.get({
          id: checkout.subscriptionId,
        });
        try {
          await syncPolarSubscriptionToConvex(
            sub as unknown as PolarSubscriptionPayload,
            user._id
          );
        } catch (syncErr) {
          console.error("[polar/verify-checkout] syncFromPolar", syncErr);
          return NextResponse.json(
            {
              error: "Failed to save subscription",
              detail: polarErrorDetail(syncErr),
            },
            { status: 500 }
          );
        }
        return NextResponse.json({ ok: true });
      } catch (e) {
        console.error(
          "[polar/verify-checkout] subscriptions.get (will try list)",
          e
        );
      }
    }

    let iter;
    try {
      iter = await polar.subscriptions.list({
        externalCustomerId: user._id,
      });
    } catch (e) {
      console.error("[polar/verify-checkout] subscriptions.list", e);
      return NextResponse.json(
        {
          error: "Polar rejected subscription list",
          detail: polarErrorDetail(e),
        },
        { status: 502 }
      );
    }

    for await (const page of iter) {
      for (const sub of page.result.items) {
        try {
          await syncPolarSubscriptionToConvex(
            sub as unknown as PolarSubscriptionPayload,
            user._id
          );
          return NextResponse.json({ ok: true });
        } catch (e) {
          console.error("[polar/verify-checkout] syncFromPolar", e);
          return NextResponse.json(
            {
              error: "Failed to save subscription",
              detail: polarErrorDetail(e),
            },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({ ok: false, reason: "no_subscription_yet" });
  } catch (e) {
    console.error("[polar/verify-checkout] unexpected", e);
    return NextResponse.json(
      {
        error: "verify_checkout_failed",
        detail: polarErrorDetail(e),
      },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
