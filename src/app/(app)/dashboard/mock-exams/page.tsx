'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/app/ProtectedRoute';
import { DashboardAppShell } from '@/components/app/DashboardAppShell';
import { openPricingModal } from '@/components/app/pricing-modal-context';

export default function MockExamsPage() {
  useEffect(() => {
    openPricingModal({
      title: 'Unlock Mock Exams',
      subtitle: 'Full-length practice exams are included on Pro. Choose a plan to get started.',
    });
  }, []);

  return (
    <ProtectedRoute>
      <DashboardAppShell>
        <main className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
          <div className="bg-white border border-gray-200 rounded-2xl p-12 max-w-md text-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Mock Exams</h1>
            <p className="text-sm text-gray-500 mb-6">
              Upgrade to Pro for full-length practice exams built from your documents.
            </p>
            <button
              type="button"
              onClick={() =>
                openPricingModal({
                  title: 'Unlock Mock Exams',
                  subtitle: 'Full-length practice exams are included on Pro. Choose a plan to get started.',
                })
              }
              className="inline-block px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold transition-colors cursor-pointer mb-3"
            >
              View pricing
            </button>
            <br />
            <Link
              href="/dashboard"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Back to dashboard
            </Link>
          </div>
        </main>
      </DashboardAppShell>
    </ProtectedRoute>
  );
}
