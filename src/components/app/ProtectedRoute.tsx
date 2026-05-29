'use client';

import { useConvexAuth, useQuery } from 'convex/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState, ReactNode } from 'react';
import { api } from '../../../convex/_generated/api';
import {
  clearCheckoutAccessGrace,
  hasCheckoutAccessGrace,
  markPaywallRedirectToCheckout,
} from '@/lib/checkout-grace';

/** Local dev only: set `NEXT_PUBLIC_DEV_BYPASS_SUBSCRIPTION=true` in `.env.local` and restart `npm run dev`. Never set on Vercel. */
function devBypassSubscription(): boolean {
  return (
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_DEV_BYPASS_SUBSCRIPTION === 'true'
  );
}

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  /** When true, users without an active trial or paid plan are sent to /checkout. */
  requireSubscription?: boolean;
}

export function ProtectedRoute({
  children,
  redirectTo = '/sign-in',
  requireSubscription = true,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [allowPaywallSyncReturn, setAllowPaywallSyncReturn] = useState(false);
  const [checkoutGrace, setCheckoutGrace] = useState(false);
  const bypassSubscription = devBypassSubscription();
  const hasPaidAccess = useQuery(
    api.subscriptions.hasPaidAccess,
    requireSubscription && !bypassSubscription ? {} : 'skip'
  );
  const subRedirected = useRef(false);

  // Returning from Polar with ?checkout=success: subscription row may not exist yet.
  // We must render children so /dashboard can run verify-checkout; otherwise we spin forever.
  useLayoutEffect(() => {
    if (typeof window === 'undefined') {
      setAllowPaywallSyncReturn(false);
      setCheckoutGrace(false);
      return;
    }
    setCheckoutGrace(hasCheckoutAccessGrace());
    if (pathname !== '/dashboard') {
      setAllowPaywallSyncReturn(false);
      return;
    }
    const p = new URLSearchParams(window.location.search);
    const ok =
      p.get('checkout') === 'success' &&
      !!(p.get('checkout_id')?.trim() ?? p.get('session_id')?.trim());
    setAllowPaywallSyncReturn(ok);
  }, [pathname]);

  useEffect(() => {
    if (hasPaidAccess === true) {
      clearCheckoutAccessGrace();
      setCheckoutGrace(false);
    }
  }, [hasPaidAccess]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  useEffect(() => {
    if (!requireSubscription || bypassSubscription || !isAuthenticated || isLoading) {
      return;
    }
    if (hasPaidAccess === undefined) {
      return;
    }
    if (!hasPaidAccess && !subRedirected.current) {
      if (allowPaywallSyncReturn || checkoutGrace) {
        return;
      }
      subRedirected.current = true;
      markPaywallRedirectToCheckout();
      router.replace('/checkout');
    }
  }, [
    requireSubscription,
    bypassSubscription,
    isAuthenticated,
    isLoading,
    hasPaidAccess,
    router,
    allowPaywallSyncReturn,
    checkoutGrace,
  ]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  if (
    requireSubscription &&
    !bypassSubscription &&
    hasPaidAccess === undefined
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (
    requireSubscription &&
    !bypassSubscription &&
    hasPaidAccess === false &&
    !allowPaywallSyncReturn &&
    !checkoutGrace
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}

