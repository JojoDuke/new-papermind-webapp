'use client';

import Link from 'next/link';
import Image from 'next/image';
import posthog from 'posthog-js';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type UseCase = {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
};

const useCases: UseCase[] = [
  {
    title: 'USMLE Prep',
    description: 'Master Step 1, 2 & 3',
    href: '/sign-up',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 2v2" />
        <path d="M5 2v2" />
        <path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1" />
        <path d="M8 15a6 6 0 0 0 12 0v-3" />
        <circle cx="20" cy="10" r="2" />
      </svg>
    ),
  },
  {
    title: 'CFA Exams',
    description: 'Conquer all three levels',
    href: '/sign-up',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
  {
    title: 'NCLEX Prep',
    description: 'Pass your nursing boards',
    href: '/sign-up',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
      </svg>
    ),
  },
  {
    title: 'ACCA Exams',
    description: 'Tackle every paper',
    href: '/sign-up',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="16" height="20" x="4" y="2" rx="2" />
        <line x1="8" x2="16" y1="6" y2="6" />
        <path d="M16 14v4" />
        <path d="M16 10h.01" />
        <path d="M12 10h.01" />
        <path d="M8 10h.01" />
        <path d="M12 14h.01" />
        <path d="M8 14h.01" />
        <path d="M12 18h.01" />
        <path d="M8 18h.01" />
      </svg>
    ),
  },
  {
    title: 'University Finals',
    description: 'Ace your degree',
    href: '/sign-up',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
        <path d="M22 10v6" />
        <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
      </svg>
    ),
  },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [useCasesOpen, setUseCasesOpen] = useState(false);
  const useCasesRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    if (!useCasesOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!useCasesRef.current?.contains(e.target as Node)) setUseCasesOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setUseCasesOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [useCasesOpen]);

  const navigateToBlog = () => {
    posthog.capture("navbar_blog_clicked");
    router.push('/blog');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md font-sans">
      <div className="max-w-[1200px] mx-auto px-4 md:px-0 h-16 flex items-center justify-between relative text-gray-900">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 relative z-10 group">
          <Image
            src="/logos-icons/pmIcon.png"
            alt="Papermind Logo"
            width={32}
            height={32}
            className="w-8 h-8 rounded-lg shadow-sm group-hover:shadow transition-all"
            priority
          />
          <span className="text-2xl font-bold font-serif leading-none tracking-tight">
            Papermind
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8 font-sans absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-[#FF5392] transition-colors font-sans">
            About
          </Link>
          <Link
          href="/blog"
          onClick={navigateToBlog}
          className="text-sm font-medium text-gray-600 hover:text-[#FF5392] transition-colors font-sans">
            Blog
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-[#FF5392] transition-colors font-sans">
            Pricing
          </Link>

          {/* Use Cases dropdown */}
          <div
            ref={useCasesRef}
            className="relative"
            onMouseEnter={() => setUseCasesOpen(true)}
            onMouseLeave={() => setUseCasesOpen(false)}
          >
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={useCasesOpen}
              onClick={() => setUseCasesOpen((v) => !v)}
              className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-[#FF5392] transition-colors font-sans outline-none focus-visible:text-[#FF5392]"
            >
              Use Cases
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform duration-200 ${useCasesOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {useCasesOpen ? (
              <div
                role="menu"
                className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[280px]"
              >
                <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-2">
                  {useCases.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      role="menuitem"
                      onClick={() => {
                        posthog.capture('navbar_use_case_clicked', { use_case: item.title });
                        setUseCasesOpen(false);
                      }}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                      <span className="mt-0.5 grid place-items-center w-9 h-9 rounded-lg bg-gray-100 text-gray-700 group-hover:bg-pink-50 group-hover:text-[#FF5392] transition-colors shrink-0">
                        {item.icon}
                      </span>
                      <span className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-gray-900 leading-snug">
                          {item.title}
                        </span>
                        <span className="text-xs text-gray-500 leading-snug mt-0.5">
                          {item.description}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-4 font-sans relative z-10">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors px-4 py-2"
            onClick={() => posthog.capture("navbar_sign_in_clicked")}
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="bg-[#FF5392] hover:bg-[#FF5392]/90 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95 font-sans"
            onClick={() => posthog.capture("navbar_start_studying_clicked")}
          >
            Start Studying
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden relative z-10 inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-100 active:bg-gray-100 transition-colors"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile full-screen overlay */}
      {mobileOpen ? (
        <div className="md:hidden fixed inset-0 z-[60] bg-white flex flex-col font-sans">
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2.5 group"
              onClick={() => setMobileOpen(false)}
            >
              <Image
                src="/logos-icons/pmIcon.png"
                alt="Papermind Logo"
                width={32}
                height={32}
                className="w-8 h-8 rounded-lg shadow-sm"
                priority
              />
              <span className="text-2xl font-bold font-serif leading-none tracking-tight">
                Papermind
              </span>
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-100 active:bg-gray-100 transition-colors"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          {/* Nav links */}
          <div className="flex-1 px-4 py-4 flex flex-col overflow-hidden">
            <Link
              href="/about"
              className="text-base font-medium text-gray-700 hover:text-[#FF5392] transition-colors py-3.5 border-b border-gray-100"
              onClick={() => setMobileOpen(false)}
            >
              About
            </Link>
            <Link
              href="/blog"
              className="text-base font-medium text-gray-700 hover:text-[#FF5392] transition-colors py-3.5 border-b border-gray-100"
              onClick={() => setMobileOpen(false)}
            >
              Blog
            </Link>
            <Link
              href="/pricing"
              className="text-base font-medium text-gray-700 hover:text-[#FF5392] transition-colors py-3.5 border-b border-gray-100"
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </Link>

            <div className="flex flex-col gap-1 pt-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-1 mb-2">Use Cases</p>
              {useCases.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  onClick={() => {
                    posthog.capture('navbar_use_case_clicked', { use_case: item.title });
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <span className="grid place-items-center w-9 h-9 rounded-lg bg-gray-100 text-gray-700 shrink-0">
                    {item.icon}
                  </span>
                  <span className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-gray-900 leading-snug">{item.title}</span>
                    <span className="text-xs text-gray-500 leading-snug">{item.description}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom CTAs */}
          <div className="px-4 pt-4 pb-8 border-t border-gray-100 flex flex-col gap-3 shrink-0">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors py-3 text-center border border-gray-200 rounded-xl"
              onClick={() => {
                posthog.capture('navbar_sign_in_clicked');
                setMobileOpen(false);
              }}
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="bg-[#FF5392] hover:bg-[#FF5392]/90 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 text-center"
              onClick={() => {
                posthog.capture('navbar_start_studying_clicked');
                setMobileOpen(false);
              }}
            >
              Start Studying
            </Link>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
