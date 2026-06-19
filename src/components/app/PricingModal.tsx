'use client';

import { useState, useEffect } from 'react';
import posthog from 'posthog-js';
import { useAuthToken } from '@convex-dev/auth/react';
import {
  DEFAULT_BILLING_PLAN,
  LIST_PRICE_MONTHLY_USD,
  YEARLY_SAVINGS_PERCENT,
  effectiveMonthlyWhenYearly,
  formatUsd,
} from '@/lib/billing';
import type { BillingInterval } from '@/lib/billing';

type PricingModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  defaultInterval?: BillingInterval;
};

const PLAN_FEATURES = [
  'Unlimited uploads',
  'Flashcards & quizzes from your docs',
  'Study guides & mock exams',
  'Progress tracking & analytics',
  'AI-powered generation',
];

export function PricingModal({
  open,
  onClose,
  title = 'Simple, transparent pricing',
  subtitle = 'One plan. Everything you need to study smarter.',
  defaultInterval = 'monthly',
}: PricingModalProps) {
  const [billing, setBilling] = useState<BillingInterval>(defaultInterval);
  const [error, setError] = useState('');
  // Pre-fetched checkout URLs keyed by interval so the click is instant
  const [checkoutUrls, setCheckoutUrls] = useState<Partial<Record<BillingInterval, string>>>({});
  const authToken = useAuthToken();

  // Reset state when modal reopens
  useEffect(() => {
    if (open) {
      setBilling(defaultInterval);
      setError('');
    }
  }, [open, defaultInterval]);

  // Load Polar embed script once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (document.getElementById('polar-embed-script')) return;
    const script = document.createElement('script');
    script.id = 'polar-embed-script';
    script.src = 'https://cdn.jsdelivr.net/npm/@polar-sh/checkout@latest/dist/embed.global.js';
    document.head.appendChild(script);
  }, []);

  // Pre-fetch checkout URL as soon as the modal opens (both intervals)
  useEffect(() => {
    if (!open || !authToken) return;
    setCheckoutUrls({});
    const intervals: BillingInterval[] = ['monthly', 'yearly'];
    intervals.forEach(async (interval) => {
      try {
        const res = await fetch('/api/polar/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ plan: DEFAULT_BILLING_PLAN, interval }),
        });
        const data: { url?: string } = res.ok ? await res.json() : {};
        if (data.url) setCheckoutUrls((prev) => ({ ...prev, [interval]: data.url }));
      } catch { /* silent — handleSubscribe will retry on click */ }
    });
  }, [open, authToken]);

  if (!open) return null;

  const price =
    billing === 'monthly'
      ? formatUsd(LIST_PRICE_MONTHLY_USD)
      : formatUsd(effectiveMonthlyWhenYearly());

  const handleSubscribe = async () => {
    setError('');
    posthog.capture('pricing_plan_selected', { plan: DEFAULT_BILLING_PLAN, interval: billing, source: 'modal' });

    let url = checkoutUrls[billing];

    // If pre-fetch hasn't resolved yet, fetch now (should be rare)
    if (!url) {
      if (!authToken) { setError('Please sign in again.'); return; }
      try {
        const res = await fetch('/api/polar/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ plan: DEFAULT_BILLING_PLAN, interval: billing }),
        });
        const data: { error?: string; url?: string } = res.ok ? await res.json() : await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : `Request failed (${res.status})`);
        url = data.url;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
        return;
      }
    }

    if (!url) { setError('Could not generate checkout link. Please try again.'); return; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const PolarEmbed = (window as any).PolarEmbedCheckout as
      | { create: (url: string, opts: { theme?: string }) => Promise<{ addEventListener: (e: string, cb: () => void) => void }> }
      | undefined;

    if (PolarEmbed) {
      onClose();
      await PolarEmbed.create(url, { theme: 'light' });
    } else {
      window.location.href = url;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-border-default bg-surface-card p-6 md:p-8 shadow-2xl flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pricing-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-surface-subtle hover:bg-border-default text-text-muted transition-colors cursor-pointer"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center pr-8">
          <h2
            id="pricing-modal-title"
            className="text-2xl md:text-3xl font-bold font-serif text-text-primary mb-2"
          >
            {title}
          </h2>
          <p className="text-sm text-text-muted font-sans">{subtitle}</p>
        </div>

        <div className="flex justify-center">
          <div className="inline-flex rounded-xl border border-border-default bg-surface-subtle p-1 gap-1 shadow-sm">
            <button
              type="button"
              onClick={() => {
                setBilling('monthly');
                posthog.capture('pricing_billing_toggle', { interval: 'monthly', source: 'modal' });
              }}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                billing === 'monthly'
                  ? 'bg-text-primary text-surface-card shadow'
                  : 'text-text-secondary hover:bg-surface-card'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => {
                setBilling('yearly');
                posthog.capture('pricing_billing_toggle', { interval: 'yearly', source: 'modal' });
              }}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center gap-2 ${
                billing === 'yearly'
                  ? 'bg-text-primary text-surface-card shadow'
                  : 'text-text-secondary hover:bg-surface-card'
              }`}
            >
              Yearly
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/30 dark:text-emerald-200">
                Save {YEARLY_SAVINGS_PERCENT}%
              </span>
            </button>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-text-muted font-sans mb-1">Papermind</p>
          <div className="flex items-end gap-1">
            <p className="text-4xl font-black font-serif text-text-primary">{price}</p>
            <p className="text-sm mb-1.5 text-text-muted">/month</p>
          </div>
          {billing === 'yearly' && (
            <p className="text-sm font-semibold mt-1 text-emerald-600 dark:text-emerald-400">Billed annually</p>
          )}
          <p className="text-sm mt-2 text-text-muted">Cancel anytime</p>
        </div>

        <ul className="flex flex-col gap-2.5">
          {PLAN_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FF5392"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 mt-0.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {f}
            </li>
          ))}
        </ul>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <button
          type="button"
          onClick={handleSubscribe}
          className="pink-glowing-button group relative w-full text-center py-3 rounded-[10px] text-white text-sm font-medium font-sans transition-all cursor-pointer"
        >
          <span className="absolute inset-0 z-20 pointer-events-none" aria-hidden>
            <span className="blurred-border absolute inset-0 z-20 rounded-[10px]" />
          </span>
          <span className="relative z-30">Subscribe now</span>
        </button>
      </div>
    </div>
  );
}
