'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDashboardNav } from '@/components/app/dashboard-nav-context';
import { openPricingModal } from '@/components/app/pricing-modal-context';

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  isActive: (pathname: string, hash: string) => boolean;
};

export function DashboardSidebar() {
  const pathname = usePathname() ?? '';
  const { mobileNavOpen, closeMobileNav } = useDashboardNav();
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

  useEffect(() => {
    closeMobileNav();
  }, [pathname, closeMobileNav]);

  const myStudyItems: NavItem[] = [
    {
      href: '/dashboard/flashcards',
      label: 'Flashcards',
      isActive: (p) => p === '/dashboard/flashcards' || p.startsWith('/dashboard/flashcards/'),
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      href: '/dashboard/quizzes',
      label: 'Quizzes',
      isActive: (p) => p.startsWith('/dashboard/quizzes'),
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" strokeWidth={2} />
          <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      href: '/dashboard/study-guides',
      label: 'Study Guides',
      isActive: (p) => p.startsWith('/dashboard/study-guides'),
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      href: '/dashboard/mock-exams',
      label: 'Mock Exams',
      isActive: (p) => p.startsWith('/dashboard/mock-exams'),
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.03-3.35M12 14v7" />
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
  const mobileExpanded = mobileNavOpen;
  const showLabels = mobileExpanded || !isSidebarCollapsed;

  const afterNav = () => closeMobileNav();

  return (
    <>
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/40 md:hidden cursor-pointer"
          onClick={closeMobileNav}
        />
      )}
      <aside
        className={[
          'bg-white border-r border-gray-200 flex flex-col overflow-x-hidden shrink-0 z-50',
          'fixed md:relative inset-y-0 left-0 h-full',
          'transition-transform duration-300 md:transition-[width] md:duration-300',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          showLabels ? 'w-64 max-w-[min(85vw,16rem)]' : 'w-16',
        ].join(' ')}
      >
      <div
        className={`flex items-center justify-between shrink-0 overflow-hidden ${showLabels ? 'p-4' : 'px-2 py-4 justify-center'}`}
      >
        <div
          onClick={!showLabels ? () => setIsSidebarCollapsed(false) : undefined}
          title={collapsedTip('Expand sidebar')}
          className={`${!showLabels ? 'cursor-ew-resize group' : ''} relative shrink-0`}
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
              className={`w-8 h-8 relative z-10 transition-opacity duration-200 ${!showLabels ? 'group-hover:opacity-0' : ''}`}
              priority
            />
            <Image
              src="/logos-icons/layouting.png"
              alt="Toggle sidebar"
              width={24}
              height={24}
              className={`w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 transition-opacity duration-200 ${!showLabels ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 pointer-events-none'}`}
              priority
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`hidden md:block hover:opacity-70 transition-all duration-200 cursor-pointer shrink-0 ${!showLabels ? 'opacity-0 invisible w-0' : 'opacity-100 visible'}`}
          aria-label="Collapse sidebar"
        >
          <Image src="/logos-icons/layouting.png" alt="Toggle sidebar" width={16} height={16} className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 px-3 pb-3 flex flex-col gap-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <Link
          href="/dashboard"
          onClick={afterNav}
          title={collapsedTip('Dashboard')}
          className={`${linkBase} ${isDashboard ? linkActive : linkInactive} ${!showLabels ? 'justify-center' : ''}`}
        >
          <svg className={`w-5 h-5 shrink-0 ${isDashboard ? 'text-pink-600' : 'text-gray-500 group-hover:text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {showLabels && (
            <span className={`font-medium ${isDashboard ? 'text-pink-700' : 'text-gray-900'}`}>
              Dashboard
            </span>
          )}
        </Link>

        {showLabels && (
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 px-2.5 pt-3 pb-0.5">My Study</p>
        )}

        {myStudyItems.map((item) => {
          const active = item.isActive(pathname, hash);
          const className = `${linkBase} ${active ? linkActive : linkInactive} ${!showLabels ? 'justify-center' : ''}`;

          if (item.label === 'Mock Exams') {
            return (
              <button
                key={item.href + item.label}
                type="button"
                title={collapsedTip(item.label)}
                onClick={() => {
                  closeMobileNav();
                  openPricingModal({
                    title: 'Unlock Mock Exams',
                    subtitle: 'Full-length practice exams are included with a paid plan. Upgrade to get started.',
                  });
                }}
                className={`${className} w-full cursor-pointer`}
              >
                <span className={`shrink-0 ${active ? 'text-pink-600' : 'text-gray-500 group-hover:text-gray-600'}`}>
                  {item.icon}
                </span>
                {showLabels && (
                  <span className={`font-medium ${active ? 'text-pink-700' : 'text-gray-900'}`}>{item.label}</span>
                )}
              </button>
            );
          }

          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              onClick={afterNav}
              title={collapsedTip(item.label)}
              className={className}
            >
              <span className={`shrink-0 ${active ? 'text-pink-600' : 'text-gray-500 group-hover:text-gray-600'}`}>
                {item.icon}
              </span>
              {showLabels && (
                <span className={`font-medium ${active ? 'text-pink-700' : 'text-gray-900'}`}>{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {showLabels && (
        <div className="px-3 pb-3">
          <div className="rounded-2xl bg-amber-50/90 border border-amber-100/80 p-3.5 relative overflow-hidden">
            <div className="absolute right-2 top-2 text-lg leading-none" aria-hidden>
              ✦
            </div>
            <p className="text-sm font-bold text-gray-900 pr-6">Upgrade your plan</p>
            <p className="text-xs text-gray-600 mt-1 mb-3 leading-snug">Unlock unlimited content and features.</p>
            <button
              type="button"
              onClick={() => {
                closeMobileNav();
                openPricingModal();
              }}
              className="pink-glowing-button group relative block w-full text-center rounded-full text-white text-xs font-semibold py-2.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              <span className="absolute inset-0 z-20 pointer-events-none" aria-hidden>
                <span className="blurred-border absolute inset-0 z-20 rounded-full" />
              </span>
              <span className="relative z-30">Upgrade now</span>
            </button>
          </div>
        </div>
      )}

    </aside>
    </>
  );
}
