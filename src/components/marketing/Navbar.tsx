'use client';

import Link from 'next/link';
import Image from 'next/image';
import posthog from 'posthog-js';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { marketingUseCases, useCaseHref } from '@/lib/marketing-use-cases';

const NCLEX_RN_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
  </svg>
);

const useCaseIcons: Record<string, React.ReactNode> = {
  'nclex-rn': NCLEX_RN_ICON,
};

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileUseCasesOpen, setMobileUseCasesOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mobileOpen) return;
    setMobileUseCasesOpen(false);
  }, [mobileOpen]);

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

  const navigateToBlog = () => {
    posthog.capture("navbar_blog_clicked");
    router.push('/blog');
  };

  return (
    <nav
      aria-hidden={mobileOpen ? true : undefined}
      className={`sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md font-sans ${
        mobileOpen ? 'max-md:invisible' : ''
      }`}
    >
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

          {marketingUseCases.map((item) => (
            <Link
              key={item.slug}
              href={useCaseHref(item.slug)}
              className="text-sm font-medium text-gray-600 hover:text-[#FF5392] transition-colors font-sans"
              onClick={() => posthog.capture('navbar_use_case_clicked', { use_case: item.title })}
            >
              {item.title}
            </Link>
          ))}
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

      {mounted && mobileOpen
        ? createPortal(
            <div className="md:hidden fixed inset-0 z-[100] bg-white flex flex-col font-sans text-gray-900">
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

              <div className="flex-1 overflow-y-auto px-4 py-2">
                <div className="flex flex-col">
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
                    onClick={() => {
                      posthog.capture('navbar_blog_clicked');
                      setMobileOpen(false);
                    }}
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

                  <div className="border-b border-gray-100">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between py-3.5 text-base font-medium text-gray-700 hover:text-[#FF5392] transition-colors"
                      aria-expanded={mobileUseCasesOpen}
                      onClick={() => setMobileUseCasesOpen((v) => !v)}
                    >
                      Use Cases
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-transform duration-200 ${mobileUseCasesOpen ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>

                    {mobileUseCasesOpen ? (
                      <div className="pb-3 flex flex-col gap-1">
                        {marketingUseCases.map((item) => (
                          <Link
                            key={item.slug}
                            href={useCaseHref(item.slug)}
                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 active:bg-gray-50 transition-colors"
                            onClick={() => {
                              posthog.capture('navbar_use_case_clicked', { use_case: item.title });
                              setMobileOpen(false);
                            }}
                          >
                            <span className="grid place-items-center w-9 h-9 rounded-lg bg-gray-100 text-gray-700 shrink-0">
                              {useCaseIcons[item.slug]}
                            </span>
                            <span className="flex flex-col min-w-0">
                              <span className="text-sm font-semibold text-gray-900 leading-snug">{item.title}</span>
                              <span className="text-xs text-gray-500 leading-snug">{item.description}</span>
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="px-4 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] border-t border-gray-100 flex flex-col gap-3 shrink-0 bg-white">
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
            </div>,
            document.body
          )
        : null}
    </nav>
  );
}
