'use client';

import { useState } from 'react';
import Link from 'next/link';
import posthog from 'posthog-js';
import {
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
};

export function PricingModal({
  open,
  onClose,
  title = 'Simple, transparent pricing',
  subtitle = 'Two plans. Pick what fits how you study.',
}: PricingModalProps) {
  const [billing, setBilling] = useState<BillingInterval>('monthly');

  if (!open) return null;

  const checkoutHref = (plan: 'starter' | 'pro') =>
    `/checkout?plan=${plan}&interval=${billing}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 md:p-8">
          <div className="text-center mb-6 pr-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FF5392] mb-2">Pricing</p>
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-gray-900 mb-2">{title}</h2>
            <p className="text-sm text-gray-500 font-sans">{subtitle}</p>
          </div>

          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 gap-1 shadow-sm">
              <button
                type="button"
                onClick={() => {
                  setBilling('monthly');
                  posthog.capture('pricing_billing_toggle', { interval: 'monthly', source: 'modal' });
                }}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  billing === 'monthly'
                    ? 'bg-gray-900 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-50'
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
                    ? 'bg-gray-900 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Yearly
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    billing === 'yearly' ? 'bg-emerald-500/30 text-emerald-100' : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  Save {YEARLY_SAVINGS_PERCENT}%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            <PlanCard
              name="Starter"
              price={
                billing === 'monthly'
                  ? formatUsd(LIST_PRICE_MONTHLY_USD.starter)
                  : formatUsd(effectiveMonthlyWhenYearly('starter'))
              }
              billing={billing}
              features={[
                'Solid monthly upload limits',
                'Flashcards & quizzes from your docs',
                'Medium & large flashcard decks',
                'Progress tracking & analytics',
                'Standard AI processing',
              ]}
              ctaHref={checkoutHref('starter')}
              ctaLabel="Start with Starter"
              variant="light"
              onSelect={() =>
                posthog.capture('pricing_plan_selected', {
                  plan: 'starter',
                  interval: billing,
                  source: 'modal',
                })
              }
            />

            <PlanCard
              name="Pro"
              price={
                billing === 'monthly'
                  ? formatUsd(LIST_PRICE_MONTHLY_USD.pro)
                  : formatUsd(effectiveMonthlyWhenYearly('pro'))
              }
              billing={billing}
              tagline="For exams & heavy prep"
              features={[
                'Everything in Starter',
                'Highest monthly limits',
                'Mock exams & full practice tests',
                'Adaptive AI quiz mode',
                'Priority AI processing',
                'Large documents & long page ranges',
              ]}
              ctaHref={checkoutHref('pro')}
              ctaLabel="Start with Pro"
              variant="dark"
              popular
              onSelect={() =>
                posthog.capture('pricing_plan_selected', {
                  plan: 'pro',
                  interval: billing,
                  source: 'modal',
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanCard({
  name,
  price,
  billing,
  tagline,
  features,
  ctaHref,
  ctaLabel,
  variant,
  popular,
  onSelect,
}: {
  name: string;
  price: string;
  billing: BillingInterval;
  tagline?: string;
  features: string[];
  ctaHref: string;
  ctaLabel: string;
  variant: 'light' | 'dark';
  popular?: boolean;
  onSelect: () => void;
}) {
  const isDark = variant === 'dark';

  return (
    <div
      className={`rounded-[20px] border-[2.5px] p-6 flex flex-col gap-5 min-h-full relative ${
        isDark
          ? 'bg-gray-900 border-gray-700'
          : 'bg-white border-gray-200'
      }`}
    >
      {popular && (
        <span className="absolute top-4 right-4 text-xs font-semibold bg-[#FF5392] text-white px-3 py-1 rounded-full font-sans">
          Most popular
        </span>
      )}
      <div>
        <p className={`text-sm font-semibold font-sans mb-1 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
          {name}
        </p>
        <div className="flex items-end gap-1">
          <p className={`text-4xl font-black font-serif ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {price}
          </p>
          <p className={`text-sm mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>/month</p>
        </div>
        {billing === 'yearly' && (
          <p className={`text-sm font-semibold mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
            Billed annually
          </p>
        )}
        {tagline && (
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>{tagline}</p>
        )}
        {!tagline && <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>Cancel anytime</p>}
      </div>
      <ul className="flex flex-col gap-2.5 flex-1">
        {features.map((f) => (
          <li
            key={f}
            className={`flex items-start gap-2 text-sm font-sans ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isDark ? '#FF5392' : '#10b981'}
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
      <Link
        href={ctaHref}
        onClick={onSelect}
        className={`mt-auto w-full text-center py-3 rounded-[10px] text-sm font-medium font-sans transition-all ${
          isDark
            ? 'pink-glowing-button text-white relative'
            : 'border-[2.5px] border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        {isDark ? (
          <>
            <span className="absolute inset-0 z-20 pointer-events-none" aria-hidden>
              <span className="blurred-border absolute inset-0 z-20 rounded-[10px]" />
            </span>
            <span className="relative z-30">{ctaLabel}</span>
          </>
        ) : (
          ctaLabel
        )}
      </Link>
    </div>
  );
}
