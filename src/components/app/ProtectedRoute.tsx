'use client';

import { useConvexAuth } from 'convex/react';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Guards a route behind authentication only.
 * Subscription/billing gates are handled inline per-feature, not here.
 */
export function ProtectedRoute({
  children,
  redirectTo = '/sign-in',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
