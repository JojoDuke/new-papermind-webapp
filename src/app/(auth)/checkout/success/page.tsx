"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthToken } from "@convex-dev/auth/react";
import { ProtectedRoute } from "@/components/app/ProtectedRoute";
import {
  markCheckoutSuccessNavigation,
  setCheckoutAccessGrace,
} from "@/lib/checkout-grace";

const VERIFY_ATTEMPTS = 8;
const VERIFY_INTERVAL_MS = 1500;

function CheckoutSuccessInner() {
  const searchParams = useSearchParams();
  const authToken = useAuthToken();
  const router = useRouter();
  const ran = useRef(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (ran.current) return;

    const checkoutId =
      searchParams?.get("checkout_id")?.trim() ??
      searchParams?.get("session_id")?.trim();

    if (!checkoutId || !authToken) {
      router.replace("/dashboard");
      return;
    }

    ran.current = true;

    (async () => {
      for (let attempt = 0; attempt < VERIFY_ATTEMPTS; attempt++) {
        try {
          const res = await fetch("/api/polar/verify-checkout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ checkoutId }),
          });
          const data = (await res.json()) as {
            ok?: boolean;
            reason?: string;
            error?: string;
          };

          if (res.ok && data.ok) {
            setCheckoutAccessGrace();
            markCheckoutSuccessNavigation();
            setDone(true);
            router.replace("/dashboard");
            return;
          }

          // Hard errors — stop polling
          if (data.reason === "checkout_not_complete" || (!res.ok && data.error)) {
            break;
          }
        } catch {
          // network hiccup — keep trying
        }
        await new Promise((r) => setTimeout(r, VERIFY_INTERVAL_MS));
      }

      // Verification timed out or failed — just go to dashboard anyway;
      // the webhook will have activated it by the time they get there.
      setDone(true);
      router.replace("/dashboard");
    })();
  }, [authToken, searchParams, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 gap-5">
      {!done && (
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
      )}
      <p className="text-sm text-gray-600 text-center">
        {done ? "All set! Taking you to your dashboard…" : "Activating your subscription…"}
      </p>
      <button
        type="button"
        onClick={() => {
          setCheckoutAccessGrace();
          router.replace("/dashboard");
        }}
        className="text-sm font-semibold text-[#FF5392] hover:underline cursor-pointer"
      >
        Continue to dashboard →
      </button>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
          </div>
        }
      >
        <CheckoutSuccessInner />
      </Suspense>
    </ProtectedRoute>
  );
}
