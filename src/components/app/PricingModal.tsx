'use client';

import { useState } from 'react';
import Link from 'next/link';
import posthog from 'posthog-js';
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
}: PricingModalProps) {
  const [billing, setBilling] = useState<BillingInterval>('monthly');

  if (!open) return null;

  const checkoutHref = `/checkout?plan=${DEFAULT_BILLING_PLAN}&interval=${billing}`;
  const price =
    billing === 'monthly'
      ? formatUsd(LIST_PRICE_MONTHLY_USD)
      : formatUsd(effectiveMonthlyWhenYearly());

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
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

          <div className="rounded-[20px] border-[2.5px] border-gray-900 bg-gray-900 p-6 flex flex-col gap-5">
            <div>
              <p className="text-sm font-semibold text-gray-400 font-sans mb-1">Papermind</p>
              <div className="flex items-end gap-1">
                <p className="text-4xl font-black font-serif text-white">{price}</p>
                <p className="text-sm mb-1.5 text-gray-400">/month</p>
              </div>
              {billing === 'yearly' && (
                <p className="text-sm font-semibold mt-1 text-emerald-400">Billed annually</p>
              )}
              <p className="text-sm mt-2 text-gray-400">7-day free trial · Cancel anytime</p>
            </div>
            <ul className="flex flex-col gap-2.5">
              {PLAN_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
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
            <Link
              href={checkoutHref}
              onClick={() =>
                posthog.capture('pricing_plan_selected', {
                  plan: DEFAULT_BILLING_PLAN,
                  interval: billing,
                  source: 'modal',
                })
              }
              className="pink-glowing-button group relative mt-auto w-full text-center py-3 rounded-[10px] text-white text-sm font-medium font-sans transition-all"
            >
              <span className="absolute inset-0 z-20 pointer-events-none" aria-hidden>
                <span className="blurred-border absolute inset-0 z-20 rounded-[10px]" />
              </span>
              <span className="relative z-30">Start free trial</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
