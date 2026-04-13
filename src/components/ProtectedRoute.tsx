'use client';

import { useConvexAuth, useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, ReactNode } from 'react';
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
  const hasPaidAccess = useQuery(
    api.subscriptions.hasPaidAccess,
    requireSubscription ? {} : 'skip'
  );
  const subRedirected = useRef(false);

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
      subRedirected.current = true;
      router.replace('/checkout');
    }
  }, [requireSubscription, isAuthenticated, isLoading, hasPaidAccess, router]);

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

  if (requireSubscription && hasPaidAccess === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}

