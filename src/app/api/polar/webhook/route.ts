import { Webhooks } from "@polar-sh/nextjs";
import {
  syncPolarSubscriptionToConvex,
  type PolarSubscriptionPayload,
} from "@/lib/polar-sync";

function asPayload(data: unknown): PolarSubscriptionPayload {
  return data as PolarSubscriptionPayload;
}

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onSubscriptionActive: async (payload) => {
    await syncPolarSubscriptionToConvex(asPayload(payload.data));
  },
  onSubscriptionCreated: async (payload) => {
    await syncPolarSubscriptionToConvex(asPayload(payload.data));
  },
  onSubscriptionUpdated: async (payload) => {
    await syncPolarSubscriptionToConvex(asPayload(payload.data));
  },
  onSubscriptionCanceled: async (payload) => {
    await syncPolarSubscriptionToConvex(asPayload(payload.data));
  },
  onSubscriptionRevoked: async (payload) => {
    await syncPolarSubscriptionToConvex(asPayload(payload.data));
  },
});

export const runtime = "nodejs";
