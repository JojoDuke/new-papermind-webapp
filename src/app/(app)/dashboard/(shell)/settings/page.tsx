'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { useRouter } from 'next/navigation';
import { api } from '../../../../../../convex/_generated/api';
import { dashboardMainClass } from '@/components/app/dashboard-page-styles';
import toast from 'react-hot-toast';

function formatDate(ms: number | undefined) {
  if (!ms) return '—';
  return new Date(ms).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function SubscriptionBadge({ state }: { state: string }) {
  if (state === 'paid') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Active
      </span>
    );
  }
  if (state === 'trial_active') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Active
      </span>
    );
  }
  if (state === 'trial_expired') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Expired
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
      No subscription
    </span>
  );
}

export default function DashboardSettingsPage() {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const user = useQuery(api.auth.currentUser);
  const subscriptionState = useQuery(api.subscriptions.getSubscriptionState);
  const subscription = useQuery(api.subscriptions.getMySubscription);

  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.assign('/sign-in');
    } catch {
      toast.error('Failed to sign out');
    }
  };

  const userInitial = (user?.name?.trim()[0] || user?.email?.[0] || '?').toUpperCase();
  const subState = subscriptionState?.state ?? 'no_subscription';

  return (
    <main className={`${dashboardMainClass} max-w-2xl`}>
          <h1 className="text-xl font-bold text-text-primary mb-1">Settings</h1>
          <p className="text-sm text-text-muted mb-8">Manage your account and subscription</p>

          {/* Profile section */}
          <section className="bg-surface-card border border-border-default rounded-2xl mb-5 overflow-hidden">
            <div className="px-6 py-4 border-b border-border-subtle">
              <h2 className="text-sm font-semibold text-text-primary">Profile</h2>
            </div>
            <div className="px-6 py-5">
              {user === undefined ? (
                <div className="h-14 bg-surface-subtle rounded-xl animate-pulse" />
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xl font-semibold shrink-0 select-none">
                    {userInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-text-primary">{user?.name || 'Unknown'}</p>
                    <p className="text-sm text-text-muted truncate">{user?.email}</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Subscription section */}
          <section className="bg-surface-card border border-border-default rounded-2xl mb-5 overflow-hidden">
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary">Subscription</h2>
              {subscriptionState && <SubscriptionBadge state={subState} />}
            </div>
            <div className="px-6 py-5 space-y-4">
              {subscriptionState === undefined ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => <div key={i} className="h-5 bg-surface-subtle rounded animate-pulse" />)}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs font-medium text-text-faint mb-0.5">Plan status</p>
                      <p className="text-text-primary font-medium capitalize">
                        {subState === 'paid' || subState === 'trial_active' ? 'Active subscriber' :
                         subState === 'trial_expired' ? 'Subscription expired' : 'No plan'}
                      </p>
                    </div>
                    {subscription?.priceId && (
                      <div>
                        <p className="text-xs font-medium text-text-faint mb-0.5">Billing</p>
                        <p className="text-text-primary font-medium">
                          {subscription.priceId.includes('yearly') || subscription.priceId.includes('annual') ? 'Annual' : 'Monthly'}
                        </p>
                      </div>
                    )}
                    {subscriptionState.trialEndsAt && subState === 'trial_expired' && (
                      <div>
                        <p className="text-xs font-medium text-text-faint mb-0.5">Ended</p>
                        <p className="text-text-primary font-medium">{formatDate(subscriptionState.trialEndsAt)}</p>
                      </div>
                    )}
                    {subscriptionState.currentPeriodEndsAt && (
                      <div>
                        <p className="text-xs font-medium text-text-faint mb-0.5">Next billing date</p>
                        <p className="text-text-primary font-medium">{formatDate(subscriptionState.currentPeriodEndsAt)}</p>
                      </div>
                    )}
                  </div>

                  {subState === 'trial_expired' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
                      <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="text-sm text-amber-700 font-medium mb-1">Your subscription has expired</p>
                        <button
                          type="button"
                          onClick={() => router.push('/upgrade')}
                          className="text-xs font-semibold text-amber-700 underline underline-offset-2 cursor-pointer"
                        >
                          Choose a plan to restore access →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Manage billing */}
                  {(subState === 'paid' || subState === 'trial_active') && (
                    <div className="pt-1">
                      <a
                        href="https://polar.sh"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Manage billing on Polar
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {/* Account actions */}
          <section className="bg-surface-card border border-border-default rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border-subtle">
              <h2 className="text-sm font-semibold text-text-primary">Account</h2>
            </div>
            <div className="px-6 py-5 space-y-3">
              {showSignOutConfirm ? (
                <div className="flex items-center gap-3">
                  <p className="text-sm text-text-secondary flex-1">Are you sure you want to sign out?</p>
                  <button
                    type="button"
                    onClick={() => setShowSignOutConfirm(false)}
                    className="px-3 py-1.5 text-sm text-text-secondary border border-border-default rounded-lg hover:bg-surface-subtle transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="px-3 py-1.5 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors cursor-pointer"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSignOutConfirm(true)}
                  className="flex items-center gap-2.5 text-sm text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              )}
            </div>
          </section>
    </main>
  );
}
