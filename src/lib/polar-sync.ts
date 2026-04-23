import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;

function toMillis(d: unknown): number | undefined {
  if (d == null) return undefined;
  if (d instanceof Date) return d.getTime();
  if (typeof d === "number" && !Number.isNaN(d)) return d;
  if (typeof d === "string") {
    const t = new Date(d).getTime();
    return Number.isNaN(t) ? undefined : t;
  }
  return undefined;
}

/**
 * Minimal subscription shape from Polar webhooks / API (avoids duplicate @polar-sh/sdk type versions).
 */
export type PolarSubscriptionPayload = {
  id: string;
  customerId: string;
  status: string;
  trialEnd: Date | null;
  currentPeriodEnd: Date;
  metadata: Record<string, unknown>;
  customer: { externalId?: string | null };
  productId: string;
};

export function convexUserIdFromSubscription(
  sub: PolarSubscriptionPayload
): string | undefined {
  const m = sub.metadata["convexUserId"];
  if (typeof m === "string" && m.length > 0) {
    return m;
  }
  if (m != null && typeof m !== "object") {
    return String(m);
  }
  const ext = sub.customer.externalId;
  if (typeof ext === "string" && ext.length > 0) {
    return ext;
  }
  return undefined;
}

export async function syncPolarSubscriptionToConvex(
  sub: PolarSubscriptionPayload,
  convexUserIdOverride?: string
) {
  const secret = process.env.POLAR_SYNC_SECRET?.trim();
  if (!secret) {
    throw new Error("POLAR_SYNC_SECRET is not configured");
  }

  const convexUserId = convexUserIdOverride ?? convexUserIdFromSubscription(sub);
  if (!convexUserId) {
    console.warn("[polar-sync] subscription missing convexUserId metadata and externalId");
    return;
  }

  const trialEndMs = toMillis(sub.trialEnd);
  const currentPeriodEndMs = toMillis(sub.currentPeriodEnd);
  const raw = sub as unknown as { product?: { id?: string } };
  const priceId = sub.productId || raw.product?.id || "";

  const convex = new ConvexHttpClient(convexUrl);
  await convex.mutation(api.subscriptions.syncFromPolar, {
    secret,
    userId: convexUserId as Id<"users">,
    polarCustomerId: sub.customerId,
    polarSubscriptionId: sub.id,
    status: String(sub.status),
    trialEndMs,
    currentPeriodEndMs,
    priceId,
  });
}
