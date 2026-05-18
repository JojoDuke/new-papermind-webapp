'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthActions } from '@convex-dev/auth/react';

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  isActive: (pathname: string, hash: string) => boolean;
};

export function DashboardSidebar() {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const { signOut } = useAuthActions();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [hash, setHash] = useState('');

  useEffect(() => {
    const sync = () => setHash(typeof window !== 'undefined' ? window.location.hash : '');
    sync();
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const myStudyItems: NavItem[] = [
    {
      href: '/dashboard/study-decks/flashcard-decks',
      label: 'Flashcards',
      isActive: (p) =>
        p.startsWith('/dashboard/study-decks/flashcard-decks') || p.startsWith('/dashboard/flashcards/'),
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      href: '/dashboard/study-decks#quiz-decks',
      label: 'Quizzes',
      isActive: (p, h) => p === '/dashboard/study-decks' && h === '#quiz-decks',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" strokeWidth={2} />
          <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      href: '/dashboard/study-decks#study-guides',
      label: 'Study Guides',
      isActive: (p, h) => p === '/dashboard/study-decks' && h === '#study-guides',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      href: '/dashboard/study-decks#mock-exams',
      label: 'Mock Exams',
      isActive: (p, h) => p === '/dashboard/study-decks' && h === '#mock-exams',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.03-3.35M12 14v7" />
        </svg>
      ),
    },
    {
      href: '/dashboard/settings',
      label: 'Settings',
      isActive: (p) => p.startsWith('/dashboard/settings'),
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const isDashboard = pathname === '/dashboard';

  const linkBase =
    'group relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 text-sm';
  const linkInactive = 'text-gray-700 hover:bg-gray-100';
  const linkActive = 'bg-pink-50 text-pink-700 hover:bg-pink-100';

  const collapsedTip = (label: string) => (isSidebarCollapsed ? label : undefined);

  return (
    <aside
      className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shrink-0 overflow-x-hidden`}
    >
      <div className={`flex items-center justify-between shrink-0 overflow-hidden ${isSidebarCollapsed ? 'px-2 py-4 justify-center' : 'p-4'}`}>
        <div
          onClick={isSidebarCollapsed ? () => setIsSidebarCollapsed(false) : undefined}
          title={collapsedTip('Expand sidebar')}
          className={`${isSidebarCollapsed ? 'cursor-ew-resize group' : ''} relative shrink-0`}
        >
          <div className="relative w-8 h-8">
            <div
              className={`absolute inset-0 -m-2 rounded-lg transition-all duration-200 ${isSidebarCollapsed ? 'group-hover:bg-pink-50' : 'bg-transparent'}`}
            />
            <Image
              src="/logos-icons/pmIcon.png"
              alt="Papermind Icon"
              width={32}
              height={32}
              className={`w-8 h-8 relative z-10 transition-opacity duration-200 ${isSidebarCollapsed ? 'group-hover:opacity-0' : ''}`}
              priority
            />
            <Image
              src="/logos-icons/layouting.png"
              alt="Toggle sidebar"
              width={24}
              height={24}
              className={`w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 transition-opacity duration-200 ${isSidebarCollapsed ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 pointer-events-none'}`}
              priority
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`hover:opacity-70 transition-all duration-200 cursor-pointer shrink-0 ${isSidebarCollapsed ? 'opacity-0 invisible w-0' : 'opacity-100 visible'}`}
          aria-label="Collapse sidebar"
        >
          <Image src="/logos-icons/layouting.png" alt="Toggle sidebar" width={16} height={16} className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 px-3 pb-3 flex flex-col gap-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <Link
          href="/dashboard"
          title={collapsedTip('Dashboard')}
          className={`${linkBase} ${isDashboard ? linkActive : linkInactive} ${isSidebarCollapsed ? 'justify-center' : ''}`}
        >
          <svg className={`w-5 h-5 shrink-0 ${isDashboard ? 'text-pink-600' : 'text-gray-500 group-hover:text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {!isSidebarCollapsed && <span className={`font-medium ${isDashboard ? 'text-pink-700' : 'text-gray-900'}`}>Dashboard</span>}
        </Link>

        {!isSidebarCollapsed && (
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 px-2.5 pt-3 pb-0.5">My Study</p>
        )}

        {myStudyItems.map((item) => {
          const active = item.isActive(pathname, hash);
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              title={collapsedTip(item.label)}
              className={`${linkBase} ${active ? linkActive : linkInactive} ${isSidebarCollapsed ? 'justify-center' : ''}`}
            >
              <span className={`shrink-0 ${active ? 'text-pink-600' : 'text-gray-500 group-hover:text-gray-600'}`}>
                {item.icon}
              </span>
              {!isSidebarCollapsed && (
                <span className={`font-medium ${active ? 'text-pink-700' : 'text-gray-900'}`}>{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {!isSidebarCollapsed && (
        <div className="px-3 pb-3">
          <div className="rounded-2xl bg-amber-50/90 border border-amber-100/80 p-3.5 relative overflow-hidden">
            <div className="absolute right-2 top-2 text-lg leading-none" aria-hidden>
              ✦
            </div>
            <p className="text-sm font-bold text-gray-900 pr-6">Upgrade to Pro</p>
            <p className="text-xs text-gray-600 mt-1 mb-3 leading-snug">Unlock unlimited content and features.</p>
            <Link
              href="/pricing"
              className="pink-glowing-button group relative block w-full text-center rounded-full text-white text-xs font-semibold py-2.5 shadow-sm transition-all active:scale-[0.98]"
            >
              <span className="absolute inset-0 z-20 pointer-events-none" aria-hidden>
                <span className="blurred-border absolute inset-0 z-20 rounded-full" />
              </span>
              <span className="relative z-30">Upgrade now</span>
            </Link>
          </div>
        </div>
      )}

      <div className="p-3 border-t border-gray-200 mt-auto">
        {isSidebarCollapsed ? (
          <div className="group relative flex justify-center">
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign Out"
              className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
              aria-label="Sign Out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
          >
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}
