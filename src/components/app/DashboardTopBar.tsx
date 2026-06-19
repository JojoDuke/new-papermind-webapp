'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from '../../../convex/_generated/api';
import { useDashboardNav } from '@/components/app/dashboard-nav-context';
import { formatUserPlanLabel, userPlanLabelClass, type UserPlan } from '@/lib/billing';

/** Persistent top-right actions: theme toggle, notifications, profile menu. */
export function DashboardTopBar() {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const { openMobileNav } = useDashboardNav();
  const user = useQuery(api.auth.currentUser);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifTab, setNotifTab] = useState<'unread' | 'all'>('unread');
  const notifRef = useRef<HTMLDivElement>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNotifications]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
        setShowSignOutConfirm(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showProfileMenu]);

  const userInitial = (user?.name?.trim()[0] || user?.email?.[0] || '?').toUpperCase();
  const userPlan = (user?.plan ?? 'free') as UserPlan;
  const planLabel = formatUserPlanLabel(userPlan);

  return (
    <div className="shrink-0 flex items-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 pt-3 pb-2 border-b border-border-subtle md:border-b-0">
      <button
        type="button"
        onClick={openMobileNav}
        className="md:hidden flex items-center justify-center w-10 h-10 -ml-1 rounded-xl text-text-secondary hover:bg-surface-subtle transition-colors cursor-pointer shrink-0"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="flex-1 md:hidden" aria-hidden />
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
      {/* Dark / light mode toggle */}
      <button
        onClick={() => setIsDarkMode((v) => !v)}
        className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-subtle transition-colors cursor-pointer text-text-muted hover:text-text-secondary"
        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      {/* Notifications bell */}
      <div ref={notifRef} className="relative">
        <div className="group relative">
          <button
            onClick={() => setShowNotifications((v) => !v)}
            className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-subtle transition-colors cursor-pointer text-text-muted hover:text-text-secondary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          {!showNotifications && (
            <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded-md bg-zinc-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Notifications
            </div>
          )}
        </div>

        {showNotifications && (
          <div className="absolute right-0 top-11 z-50 w-[min(20rem,calc(100vw-2rem))] bg-surface-card rounded-2xl shadow-xl border border-border-subtle overflow-hidden">
            <div className="px-4 pt-4 pb-3">
              <span className="text-sm font-bold text-text-primary">Notifications</span>
            </div>
            <div className="flex gap-2 px-4 pb-3">
              {(['unread', 'all'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setNotifTab(tab)}
                  className={`flex-1 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer capitalize ${
                    notifTab === tab
                      ? 'border-pink-400 text-pink-600 bg-pink-50 dark:bg-pink-950/30 dark:text-pink-400'
                      : 'border-border-default text-text-muted hover:border-border-strong'
                  }`}
                >
                  {tab === 'unread' ? 'Unread' : 'All'}
                </button>
              ))}
            </div>
            <div className="h-px bg-border-subtle" />
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <p className="text-sm font-semibold text-text-secondary mb-1">
                {notifTab === 'unread' ? 'Nothing New Here' : 'No notifications yet'}
              </p>
              <p className="text-xs text-text-faint">
                {notifTab === 'unread'
                  ? "You're all caught up!"
                  : 'Notifications will appear here when there is activity.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* User profile */}
      <div ref={profileRef} className="relative">
        <div className="group relative">
          <div
            onClick={() => setShowProfileMenu((v) => !v)}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold cursor-pointer select-none shrink-0"
          >
            {userInitial}
          </div>
          {!showProfileMenu && (
            <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded-md bg-zinc-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
              View Profile
            </div>
          )}
        </div>

        {showProfileMenu && (
          <div className="absolute right-0 top-11 z-50 w-[min(16rem,calc(100vw-2rem))] bg-surface-card rounded-2xl shadow-xl border border-border-subtle overflow-hidden py-2">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-text-faint truncate">{user?.email}</p>
                <p className={`text-xs font-medium mt-0.5 ${userPlanLabelClass(userPlan)}`}>
                  {planLabel}
                </p>
              </div>
            </div>

            <div className="h-px bg-border-subtle mx-2 my-1" />

            <button
              onClick={() => {
                setShowProfileMenu(false);
                router.push('/dashboard/settings');
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-surface-subtle transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-text-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>

            <div className="h-px bg-border-subtle mx-2 my-1" />

            {showSignOutConfirm ? (
              <div className="px-4 py-3 flex flex-col gap-2">
                <p className="text-xs text-text-secondary font-medium">Are you sure you want to sign out?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSignOutConfirm(false)}
                    className="flex-1 py-1.5 text-xs font-medium text-text-secondary border border-border-default rounded-lg hover:bg-surface-subtle transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => signOut()}
                    className="flex-1 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors cursor-pointer"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowSignOutConfirm(true)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
