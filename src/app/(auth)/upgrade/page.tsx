'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useAuthActions, useAuthToken } from '@convex-dev/auth/react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { ProtectedRoute } from '@/components/app/ProtectedRoute';
import type { BillingInterval, BillingPlan } from '@/lib/billing';
import {
  LIST_PRICE_MONTHLY_USD,
  YEARLY_SAVINGS_PERCENT,
  effectiveMonthlyWhenYearly,
  formatUsd,
} from '@/lib/billing';

const PLAN_META: { id: BillingPlan; name: string; description: string; features: string[] }[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Solid limits for regular study weeks.',
    features: [
      'Flashcards & quizzes from your PDFs',
      'Up to 5 uploads',
      'Standard AI generation speed',
      'Progress tracking',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Everything in Starter, plus mock exams and priority AI.',
    features: [
      'Unlimited uploads',
      'Mock exams (NCLEX-RN)',
      'Priority AI generation',
      'Advanced progress analytics',
      'Study guides & AI chat',
    ],
  },
];

function UpgradeContent() {
  const { signOut } = useAuthActions();
  const authToken = useAuthToken();
  const searchParams = useSearchParams();
  const subscriptionState = useQuery(api.subscriptions.getSubscriptionState);
  const [plan, setPlan] = useState<BillingPlan>('pro');
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (document.getElementById('polar-embed-script')) return;
    const script = document.createElement('script');
    script.id = 'polar-embed-script';
    script.src = 'https://cdn.jsdelivr.net/npm/@polar-sh/checkout@latest/dist/embed.global.js';
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    const qPlan = searchParams?.get('plan');
    const qInterval = searchParams?.get('interval');
    if (qPlan === 'starter' || qPlan === 'pro') setPlan(qPlan);
    if (qInterval === 'monthly' || qInterval === 'yearly') setBillingInterval(qInterval);
  }, [searchParams]);

  // If user now has active access (e.g. after subscribing), redirect to dashboard
  useEffect(() => {
    if (!subscriptionState) return;
    const { state } = subscriptionState;
    if (state === 'paid' || state === 'trial_active') {
      window.location.assign('/dashboard');
    }
  }, [subscriptionState]);

  const trialExpiredAt = useMemo(() => {
    if (!subscriptionState?.trialEndsAt) return null;
    return new Date(subscriptionState.trialEndsAt).toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [subscriptionState]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      window.location.assign('/sign-in');
    } finally {
      setLoggingOut(false);
    }
  };

  const startCheckout = async () => {
    setError('');
    if (!authToken) { setError('Please sign in again.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/polar/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ plan, interval: billingInterval }),
      });
      const raw = await res.text();
      let data: { error?: string; url?: string } = {};
      try { data = raw ? JSON.parse(raw) : {}; } catch { data = {}; }
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : `Request failed (${res.status})`);
      }
      if (!data.url) throw new Error('No checkout URL returned');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const PolarEmbed = (window as any).PolarEmbedCheckout as
        | { create: (url: string, opts: object) => Promise<{ addEventListener: (e: string, cb: () => void) => void }> }
        | undefined;

      if (PolarEmbed) {
        const checkout = await PolarEmbed.create(data.url, { theme: 'light', onLoaded: () => setLoading(false) });
        checkout.addEventListener('close', () => setLoading(false));
      } else {
        window.location.href = data.url;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left — form */}
      <div className="flex-1 flex items-start justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Top nav */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors">
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

          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <Image src="/logos-icons/pmIcon.png" alt="" width={40} height={40} className="w-10 h-10" />
            <h1 className="text-2xl font-bold text-gray-900">Your trial has ended</h1>
          </div>

          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            {trialExpiredAt
              ? `Your free trial expired on ${trialExpiredAt}. `
              : 'Your free trial has expired. '}
            Choose a plan below to get back into Papermind and keep your progress.
          </p>

          {/* Interval toggle */}
          <div className="mb-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Billing</p>
            <div className="flex rounded-xl border border-gray-200 bg-white p-1 gap-1">
              <button
                type="button"
                onClick={() => setBillingInterval('monthly')}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all cursor-pointer ${billingInterval === 'monthly' ? 'bg-pink-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingInterval('yearly')}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all cursor-pointer flex flex-col items-center justify-center leading-tight sm:flex-row sm:gap-1.5 ${billingInterval === 'yearly' ? 'bg-pink-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <span>Yearly</span>
                <span className={`text-[10px] sm:text-xs font-semibold ${billingInterval === 'yearly' ? 'text-pink-100' : 'text-emerald-600'}`}>
                  Save {YEARLY_SAVINGS_PERCENT}%
                </span>
              </button>
            </div>
          </div>

          {/* Plan cards */}
          <div className="space-y-3 mb-6">
            {PLAN_META.map((p) => {
              const monthly = LIST_PRICE_MONTHLY_USD[p.id];
              const priceLine =
                billingInterval === 'monthly'
                  ? `${formatUsd(monthly)}/mo`
                  : `${formatUsd(effectiveMonthlyWhenYearly(p.id))}/mo`;
              const sub = billingInterval === 'yearly' ? 'Billed Annually' : undefined;
              const isSelected = plan === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlan(p.id)}
                  className={`w-full text-left rounded-xl border-2 p-4 transition-all cursor-pointer ${isSelected ? 'border-[#FF5392] bg-pink-50/80' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-[#FF5392] flex items-center justify-center shrink-0">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                            <path d="M9.707 3.293a1 1 0 010 1.414L5.414 9l-2.121-2.121a1 1 0 111.414-1.414L5.414 6.172l2.879-2.879a1 1 0 011.414 0z" />
                          </svg>
                        </span>
                      )}
                      <span className="font-semibold text-gray-900">{p.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-gray-900 font-semibold block tabular-nums">{priceLine}</span>
                      {sub && <span className="text-xs text-emerald-600 font-medium block mt-0.5">{sub}</span>}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{p.description}</p>
                  <ul className="space-y-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
                        <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
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
            Secured by Polar. Cancel anytime.
          </p>
        </div>
      </div>

      {/* Right — branding panel */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden items-center justify-center p-10" style={{ backgroundColor: '#f0ecff' }}>
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 px-8 py-8 w-full max-w-sm">
          <h2 className="text-2xl font-bold font-serif mb-6" style={{ color: '#1e0a4a' }}>
            Your progress is waiting
          </h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Your uploaded documents, flashcards, quizzes, and study history are all saved. Subscribe to pick up exactly where you left off.
          </p>
          <div className="space-y-4">
            {[
              { icon: '🗂️', text: 'All your uploaded PDFs are preserved' },
              { icon: '🃏', text: 'Flashcard decks and quiz history intact' },
              { icon: '📊', text: 'Progress tracking continues from where you left off' },
              { icon: '🎓', text: 'Mock exams available on Pro' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-xl">{icon}</span>
                <p className="text-sm text-gray-700">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <ProtectedRoute requireSubscription={false}>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
        </div>
      }>
        <UpgradeContent />
      </Suspense>
    </ProtectedRoute>
  );
}
