'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthToken } from '@convex-dev/auth/react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import type { BillingPlan } from '@/lib/billing';
import { TRIAL_DAYS } from '@/lib/billing';

const PLANS: { id: BillingPlan; name: string; price: string; blurb: string }[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$12/mo',
    blurb: 'After your trial — solid limits for regular study weeks.',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29/mo',
    blurb: 'After your trial — highest limits, mock exams, priority AI.',
  },
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authToken = useAuthToken();
  const hasAccess = useQuery(api.subscriptions.hasPaidAccess);
  const [plan, setPlan] = useState<BillingPlan>('pro');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const q = searchParams.get('plan');
    if (q === 'starter' || q === 'pro') {
      setPlan(q);
      return;
    }
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('pm_checkout_plan');
      if (stored === 'starter' || stored === 'pro') {
        setPlan(stored);
        sessionStorage.removeItem('pm_checkout_plan');
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (hasAccess === true) {
      router.replace('/dashboard');
    }
  }, [hasAccess, router]);

  const canceled = searchParams.get('canceled') === '1';

  const trialEndsOnLabel = useMemo(() => {
    const end = new Date();
    end.setDate(end.getDate() + TRIAL_DAYS);
    return end.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  const startCheckout = async () => {
    setError('');
    if (!authToken) {
      setError('Please sign in again.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Could not start checkout');
      }
      if (data.url && typeof data.url === 'string') {
        window.location.href = data.url;
        return;
      }
      throw new Error('No checkout URL returned');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (hasAccess === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
      </div>
    );
  }

  if (hasAccess) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gray-50">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <Image src="/logos-icons/pmIcon.png" alt="" width={40} height={40} className="w-10 h-10" />
            <h1 className="text-2xl font-bold text-gray-900">Start your free trial</h1>
          </div>

          <div className="text-gray-600 mb-4 space-y-2.5 text-sm leading-relaxed">
            <p>
              <span className="font-semibold text-gray-900">Pay $0 today.</span>{' '}
              Your {TRIAL_DAYS}-day trial is 100% free, ending{' '}
              <span className="font-semibold text-gray-900">{trialEndsOnLabel}</span>
              {' '}
              — cancel anytime.
            </p>
            <p className="text-gray-500">
              Add a card to unlock the app. You won&apos;t be charged until after the trial ends.
            </p>
          </div>
          {canceled && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
              Checkout was canceled. Choose a plan below when you&apos;re ready.
            </p>
          )}

          <div className="space-y-3 mb-6">
            {PLANS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlan(p.id)}
                className={`w-full text-left rounded-xl border-2 p-4 transition-all cursor-pointer ${
                  plan === p.id
                    ? 'border-[#FF5392] bg-pink-50/80'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-gray-900">{p.name}</span>
                  <span className="text-gray-700 font-medium">{p.price}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{p.blurb}</p>
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
          )}

          <button
            type="button"
            onClick={startCheckout}
            disabled={loading}
            className="w-full text-white py-3.5 px-4 rounded-xl font-semibold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{ backgroundColor: loading ? '#FF539266' : '#FF5392' }}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Redirecting to secure checkout…
              </span>
            ) : (
              'Continue to secure payment'
            )}
          </button>

          <p className="text-xs text-gray-400 mt-4 text-center">
            Secured by Stripe. Cancel anytime before the trial ends and you won&apos;t be charged.
          </p>
        </div>
      </div>

      <div
        className="hidden lg:flex lg:flex-1 relative overflow-hidden items-center justify-center p-10"
        style={{ backgroundColor: '#f0ecff' }}
      >
        <div className="max-w-sm text-center">
          <p className="text-lg font-serif font-bold mb-2" style={{ color: '#1e0a4a' }}>
            Why we ask for a card
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#3d2d6e' }}>
            It keeps accounts fair and lets us focus on students who are serious about studying — without showing ads or selling your data.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute requireSubscription={false}>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
          </div>
        }
      >
        <CheckoutContent />
      </Suspense>
    </ProtectedRoute>
  );
}
