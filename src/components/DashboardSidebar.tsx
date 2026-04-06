'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthActions } from '@convex-dev/auth/react';

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuthActions();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const isHome = pathname === '/dashboard';

  const isStudyDecks =
    pathname.startsWith('/dashboard/study-decks') ||
    pathname.startsWith('/dashboard/flashcards');

  return (
    <aside
      className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shrink-0`}
    >
      <div className="p-4 flex items-center justify-between">
        <div
          onClick={isSidebarCollapsed ? () => setIsSidebarCollapsed(false) : undefined}
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
          <div
            className={`absolute left-full ml-6 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-white text-gray-900 text-xs rounded-md transition-all duration-200 whitespace-nowrap pointer-events-none z-50 shadow-md border border-gray-200 ${isSidebarCollapsed ? 'opacity-0 invisible group-hover:opacity-100 group-hover:visible' : 'opacity-0 invisible'}`}
          >
            Toggle sidebar
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`hover:opacity-70 transition-all duration-200 cursor-pointer shrink-0 ${isSidebarCollapsed ? 'opacity-0 invisible w-0' : 'opacity-100 visible'}`}
          aria-label="Collapse sidebar"
        >
          <Image
            src="/logos-icons/layouting.png"
            alt="Toggle sidebar"
            width={16}
            height={16}
            className="w-4 h-4"
          />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-7">
        <Link
          href="/dashboard"
          className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
            isHome ? 'bg-pink-50 text-pink-700 hover:bg-pink-100' : 'text-gray-700 hover:bg-gray-100'
          } ${isSidebarCollapsed ? 'justify-center' : ''}`}
        >
          <svg
            className={`w-5 h-5 shrink-0 ${isHome ? 'text-pink-600' : 'text-gray-700'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          {!isSidebarCollapsed && (
            <span className={`text-sm font-medium ${isHome ? 'text-pink-700' : 'text-gray-700'}`}>
              Homepage
            </span>
          )}
          {isSidebarCollapsed && (
            <div className="absolute left-full ml-6 px-2.5 py-1.5 bg-white text-gray-900 text-xs rounded-md transition-all duration-200 whitespace-nowrap pointer-events-none z-50 shadow-md border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible">
              Homepage
            </div>
          )}
        </Link>

        <Link
          href="/dashboard/study-decks"
          className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
            isStudyDecks ? 'bg-pink-50 text-pink-700 hover:bg-pink-100' : 'text-gray-700 hover:bg-gray-100'
          } ${isSidebarCollapsed ? 'justify-center' : ''}`}
        >
          <svg
            className={`w-5 h-5 shrink-0 ${isStudyDecks ? 'text-pink-600' : 'text-gray-700'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          {!isSidebarCollapsed && (
            <span className={`text-sm font-medium ${isStudyDecks ? 'text-pink-700' : 'text-gray-700'}`}>
              Study Decks
            </span>
          )}
          {isSidebarCollapsed && (
            <div className="absolute left-full ml-6 px-2.5 py-1.5 bg-white text-gray-900 text-xs rounded-md transition-all duration-200 whitespace-nowrap pointer-events-none z-50 shadow-md border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible">
              Study Decks
            </div>
          )}
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-200">
        {isSidebarCollapsed ? (
          <div className="group relative flex justify-center">
            <button
              type="button"
              onClick={handleSignOut}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
              aria-label="Sign Out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
            <div className="absolute left-full ml-6 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-white text-gray-900 text-xs rounded-md whitespace-nowrap pointer-events-none z-50 shadow-md border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              Sign Out
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
          >
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}
