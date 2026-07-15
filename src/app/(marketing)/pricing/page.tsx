'use client';

import { useState } from 'react';
import Link from 'next/link';
import posthog from 'posthog-js';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import {
  DEFAULT_BILLING_PLAN,
  LIST_PRICE_MONTHLY_USD,
  YEARLY_SAVINGS_PERCENT,
  effectiveMonthlyWhenYearly,
  formatUsd,
} from '@/lib/billing';
import type { BillingInterval } from '@/lib/billing';

const PLAN_FEATURES = [
  'Unlimited uploads',
  'Flashcards & quizzes from your docs',
  'Study guides & mock exams',
  'Progress tracking & analytics',
  'AI-powered generation',
];

const FREE_PLAN_FEATURES = [
  'Upload up to 2 documents',
  '1 flashcard deck per document',
  '1 quiz & study guide per document',
  '1 mock exam preview',
  'Progress tracking',
];

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingInterval>('yearly');

  const authHref = `/sign-up?plan=${DEFAULT_BILLING_PLAN}&interval=${billing}`;

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50/50 via-white to-purple-50/30 relative overflow-x-hidden">
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-4 md:px-0 py-16 md:py-24 text-center">
        <section className="text-left">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FF5392] mb-3">Pricing</p>
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 mb-4">Simple, transparent pricing</h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto font-sans">Start for free, then upgrade when you&apos;re ready.</p>
          </div>

          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 gap-1 shadow-sm">
              <button
                type="button"
                onClick={() => { setBilling('monthly'); posthog.capture('pricing_billing_toggle', { interval: 'monthly' }); }}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  billing === 'monthly'
                    ? 'bg-gray-900 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => { setBilling('yearly'); posthog.capture('pricing_billing_toggle', { interval: 'yearly' }); }}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center gap-2 ${
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

          <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
            <div className="bg-white rounded-[20px] border border-gray-200 p-7 md:p-8 flex flex-col gap-6 min-h-full shadow-sm">
              <div>
                <p className="text-sm font-semibold text-gray-500 font-sans mb-1">Free</p>
                <div className="flex items-end gap-1">
                  <p className="text-5xl font-black font-serif text-gray-900">$0</p>
                  <p className="text-gray-500 font-sans text-sm mb-2">/month</p>
                </div>
                <p className="text-sm text-gray-500 font-sans mt-2">Free forever. No credit card required.</p>
              </div>
              <ul className="flex flex-col gap-3 flex-1">
                {FREE_PLAN_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-600 font-sans">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF5392" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="mt-auto w-full rounded-[10px] border border-gray-300 py-3 text-center text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 active:scale-95"
                onClick={() => posthog.capture('pricing_plan_selected', { plan: 'free' })}
              >
                Get started free
              </Link>
            </div>

            <div className="bg-gray-900 rounded-[20px] border-[2.5px] border-gray-700 p-7 md:p-8 flex flex-col gap-6 min-h-full">
              <div>
                <p className="text-sm font-semibold text-gray-400 font-sans mb-1">Papermind Pro</p>
                <div className="flex items-end gap-1 flex-wrap">
                  <p className="text-5xl font-black font-serif text-white">
                    {formatUsd(billing === 'monthly' ? LIST_PRICE_MONTHLY_USD : effectiveMonthlyWhenYearly())}
                  </p>
                  <p className="text-gray-400 font-sans text-sm mb-2">/month</p>
                </div>
                {billing === 'yearly' && (
                  <p className="text-sm text-emerald-400 font-semibold font-sans mt-1">Billed Annually</p>
                )}
                <p className="text-sm text-gray-400 font-sans mt-2">Cancel anytime</p>
              </div>
              <ul className="flex flex-col gap-3 flex-1">
                {PLAN_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300 font-sans">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF5392" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={authHref}
                className="pink-glowing-button group relative mt-auto w-full text-center py-3 rounded-[10px] text-white font-medium text-sm font-sans transition-all active:scale-95 outline-none focus:outline-none"
                onClick={() => posthog.capture('pricing_plan_selected', { plan: DEFAULT_BILLING_PLAN, interval: billing })}
              >
                <span className="absolute inset-0 z-20 pointer-events-none" aria-hidden="true">
                  <span className="blurred-border absolute inset-0 z-20" />
                </span>
                <span className="relative z-30">Subscribe now</span>
              </Link>
            </div>
          </div>

          <p className="text-center mt-12 text-sm text-gray-500 font-sans">
            <Link href="/" className="text-[#FF5392] hover:underline font-medium">
              ← Back to home
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
