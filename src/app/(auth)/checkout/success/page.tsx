"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthToken } from "@convex-dev/auth/react";
import { ProtectedRoute } from "@/components/app/ProtectedRoute";
import {
  markCheckoutSuccessNavigation,
  setCheckoutAccessGrace,
} from "@/lib/checkout-grace";

const VERIFY_ATTEMPTS = 15;
const VERIFY_INTERVAL_MS = 1500;

function CheckoutSuccessInner() {
  const searchParams = useSearchParams();
  const authToken = useAuthToken();
  const ran = useRef(false);
  const [message, setMessage] = useState("Activating your subscription…");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ran.current) return;

    const checkoutId =
      searchParams?.get("checkout_id")?.trim() ??
      searchParams?.get("session_id")?.trim();

    if (!checkoutId) {
      setError("Missing checkout confirmation. Start again from checkout.");
      return;
    }

    if (!authToken) {
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
            window.location.assign("/dashboard");
            return;
          }

          if (!res.ok && data.error) {
            setError(data.error);
            return;
          }

          if (data.reason === "checkout_not_complete") {
            setError("Checkout did not complete. Try again from checkout.");
            return;
          }

          setMessage(
            attempt < VERIFY_ATTEMPTS - 1
              ? "Finalizing with Polar…"
              : "Still waiting on Polar…"
          );
        } catch {
          setMessage("Retrying…");
        }
        await new Promise((r) => setTimeout(r, VERIFY_INTERVAL_MS));
      }

      setError(
        "We could not confirm your subscription yet. Refresh this page or open Support from checkout."
      );
    })();
  }, [authToken, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <p className="text-sm text-red-600 text-center max-w-md mb-4">{error}</p>
        <Link
          href="/checkout"
          className="text-sm font-semibold text-[#FF5392] hover:underline"
        >
          Back to checkout
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mb-4" />
      <p className="text-sm text-gray-600 text-center">{message}</p>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <ProtectedRoute requireSubscription={false}>
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
