'use client';

import { useConvexAuth, useQuery } from 'convex/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState, ReactNode } from 'react';
import { api } from '../../convex/_generated/api';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  /** When true, users without an active trial or paid plan are sent to /checkout. */
  requireSubscription?: boolean;
}

export function ProtectedRoute({
  children,
  redirectTo = '/auth',
  requireSubscription = true,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [allowPaywallSyncReturn, setAllowPaywallSyncReturn] = useState(false);
  const hasPaidAccess = useQuery(
    api.subscriptions.hasPaidAccess,
    requireSubscription ? {} : 'skip'
  );
  const subRedirected = useRef(false);

  // Returning from Polar with ?checkout=success: subscription row may not exist yet.
  // We must render children so /dashboard can run verify-checkout; otherwise we spin forever.
  useLayoutEffect(() => {
    if (pathname !== '/dashboard' || typeof window === 'undefined') {
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
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  useEffect(() => {
    if (!requireSubscription || !isAuthenticated || isLoading) {
      return;
    }
    if (hasPaidAccess === undefined) {
      return;
    }
    if (!hasPaidAccess && !subRedirected.current) {
      if (allowPaywallSyncReturn) {
        return;
      }
      subRedirected.current = true;
      router.replace('/checkout');
    }
  }, [
    requireSubscription,
    isAuthenticated,
    isLoading,
    hasPaidAccess,
    router,
    allowPaywallSyncReturn,
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

  if (requireSubscription && hasPaidAccess === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (
    requireSubscription &&
    hasPaidAccess === false &&
    !allowPaywallSyncReturn
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}

