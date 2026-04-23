'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthActions, useAuthToken } from '@convex-dev/auth/react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import type { BillingInterval, BillingPlan } from '@/lib/billing';
import {
  LIST_PRICE_MONTHLY_USD,
  TRIAL_DAYS,
  YEARLY_SAVINGS_PERCENT,
  effectiveMonthlyWhenYearly,
  formatUsd,
} from '@/lib/billing';

const PLAN_META: {
  id: BillingPlan;
  name: string;
  blurbMonthly: string;
  blurbYearly: string;
}[] = [
  {
    id: 'starter',
    name: 'Starter',
    blurbMonthly: 'After your trial — solid limits for regular study weeks.',
    blurbYearly: 'After your trial — same limits, best value for a full school year.',
  },
  {
    id: 'pro',
    name: 'Pro',
    blurbMonthly: 'After your trial — highest limits, mock exams, priority AI.',
    blurbYearly: 'After your trial — full power for serious exam seasons.',
  },
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signOut } = useAuthActions();
  const authToken = useAuthToken();
  const hasAccess = useQuery(api.subscriptions.hasPaidAccess);
  const [plan, setPlan] = useState<BillingPlan>('pro');
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState('');

  // Load Polar embed script from CDN once on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (document.getElementById('polar-embed-script')) return;
    const script = document.createElement('script');
    script.id = 'polar-embed-script';
    script.src =
      'https://cdn.jsdelivr.net/npm/@polar-sh/checkout@latest/dist/embed.global.js';
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    const qPlan = searchParams.get('plan');
    const qInterval = searchParams.get('interval');
    if (qPlan === 'starter' || qPlan === 'pro') {
      setPlan(qPlan);
    }
    if (qInterval === 'monthly' || qInterval === 'yearly') {
      setBillingInterval(qInterval);
    }
    if (typeof window !== 'undefined') {
      const storedPlan = sessionStorage.getItem('pm_checkout_plan');
      if (storedPlan === 'starter' || storedPlan === 'pro') {
        setPlan(storedPlan);
        sessionStorage.removeItem('pm_checkout_plan');
      }
      const storedInterval = sessionStorage.getItem('pm_checkout_interval');
      if (storedInterval === 'monthly' || storedInterval === 'yearly') {
        setBillingInterval(storedInterval);
        sessionStorage.removeItem('pm_checkout_interval');
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

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      window.location.assign('/auth');
    } finally {
      setLoggingOut(false);
    }
  };

  const startCheckout = async () => {
    setError('');
    if (!authToken) {
      setError('Please sign in again.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/polar/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ plan, interval: billingInterval }),
      });
      const raw = await res.text();
      let data: { error?: string; url?: string } = {};
      try {
        data = raw ? (JSON.parse(raw) as { error?: string; url?: string }) : {};
      } catch {
        data = {};
      }
      if (!res.ok) {
        const detail =
          typeof data.error === 'string'
            ? data.error
            : raw?.trim()
              ? raw.slice(0, 400)
              : `Request failed (${res.status})`;
        throw new Error(detail);
      }
      if (!data.url || typeof data.url !== 'string') {
        throw new Error('No checkout URL returned');
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const PolarEmbed = (window as any).PolarEmbedCheckout as
        | {
            create: (
              url: string,
              opts: { theme?: string; onLoaded?: () => void }
            ) => Promise<{ addEventListener: (event: string, cb: () => void) => void }>;
          }
        | undefined;

      if (PolarEmbed) {
        const checkout = await PolarEmbed.create(data.url, {
          theme: 'light',
          onLoaded: () => setLoading(false),
        });
        // If the user closes the modal without paying, re-enable the button
        checkout.addEventListener('close', () => setLoading(false));
        // On success Polar automatically redirects to our successUrl — no action needed
      } else {
        // CDN script not yet loaded — fall back to full-page redirect
        window.location.href = data.url;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
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
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={loggingOut}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {loggingOut ? 'Signing out…' : 'Log out'}
            </button>
          </div>

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

          <div className="mb-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Billing</p>
            <div className="flex rounded-xl border border-gray-200 bg-white p-1 gap-1">
              <button
                type="button"
                onClick={() => setBillingInterval('monthly')}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all cursor-pointer ${
                  billingInterval === 'monthly'
                    ? 'bg-pink-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingInterval('yearly')}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all cursor-pointer flex flex-col items-center justify-center leading-tight sm:flex-row sm:gap-1.5 ${
                  billingInterval === 'yearly'
                    ? 'bg-pink-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>Yearly</span>
                <span
                  className={`text-[10px] sm:text-xs font-semibold ${
                    billingInterval === 'yearly' ? 'text-pink-100' : 'text-emerald-600'
                  }`}
                >
                  Save {YEARLY_SAVINGS_PERCENT}%
                </span>
              </button>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {PLAN_META.map((p) => {
              const monthly = LIST_PRICE_MONTHLY_USD[p.id];
              const priceLine =
                billingInterval === 'monthly'
                  ? `${formatUsd(monthly)}/mo`
                  : `${formatUsd(effectiveMonthlyWhenYearly(p.id))}/mo`;
              const sub = billingInterval === 'yearly' ? 'Billed Annually' : undefined;
              const blurb =
                billingInterval === 'yearly' ? p.blurbYearly : p.blurbMonthly;
              return (
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
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-gray-900">{p.name}</span>
                    <div className="text-right shrink-0">
                      <span className="text-gray-900 font-semibold block tabular-nums">{priceLine}</span>
                      {sub && (
                        <span className="text-xs text-emerald-600 font-medium block mt-1">{sub}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{blurb}</p>
                </button>
              );
            })}
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
                Opening checkout…
              </span>
            ) : (
              'Continue to secure payment'
            )}
          </button>

          <p className="text-xs text-gray-400 mt-4 text-center">
            Secured by Polar. Cancel anytime before the trial ends and you won&apos;t be charged.
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
