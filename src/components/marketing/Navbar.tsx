'use client';

import Link from 'next/link';
import Image from 'next/image';
import posthog from 'posthog-js';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

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
          <Link href="/company" className="text-sm font-medium text-gray-600 hover:text-[#FF5392] transition-colors font-sans">
            Company
          </Link>
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

      {/* Mobile dropdown */}
      {mobileOpen ? (
        <div className="md:hidden">
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/20"
            aria-label="Close menu overlay"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 right-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md shadow-lg">
            <div className="max-w-[1200px] mx-auto px-4 py-4 flex flex-col gap-3">
              <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-[#FF5392] transition-colors py-2" onClick={() => setMobileOpen(false)}>
                About
              </Link>
              <Link href="/blog" className="text-sm font-medium text-gray-700 hover:text-[#FF5392] transition-colors py-2" onClick={() => setMobileOpen(false)}>
                Blog
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-gray-700 hover:text-[#FF5392] transition-colors py-2" onClick={() => setMobileOpen(false)}>
                Pricing
              </Link>
              <Link href="/company" className="text-sm font-medium text-gray-700 hover:text-[#FF5392] transition-colors py-2" onClick={() => setMobileOpen(false)}>
                Company
              </Link>

              <div className="h-px bg-gray-100 my-1" />

              <Link
                href="/sign-in"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors py-2"
                onClick={() => {
                  posthog.capture('navbar_sign_in_clicked');
                  setMobileOpen(false);
                }}
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="bg-[#FF5392] hover:bg-[#FF5392]/90 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95 text-center"
                onClick={() => {
                  posthog.capture('navbar_start_studying_clicked');
                  setMobileOpen(false);
                }}
              >
                Start Studying
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
