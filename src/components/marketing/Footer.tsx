'use client';

import Link from 'next/link';
import Image from 'next/image';

const footerLinks = {
  Product: [
    { label: 'Pricing', href: '/pricing' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

export function Footer() {
  return (
    <footer className="w-full border-t border-border-subtle bg-surface-card font-sans">
      <div className="max-w-[1200px] mx-auto px-4 md:px-0 py-14">
        {/* Top row: Brand + Links */}
        <div className="flex flex-col md:flex-row md:items-start gap-12 md:gap-0 md:justify-between">
          {/* Brand */}
          <div className="flex flex-col gap-4 max-w-xs">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <Image
                src="/logos-icons/pmIcon.png"
                alt="Papermind Logo"
                width={32}
                height={32}
                className="w-8 h-8 rounded-lg shadow-sm group-hover:shadow transition-all"
              />
              <span className="text-2xl font-bold font-serif leading-none tracking-tight text-text-primary">
                Papermind
              </span>
            </Link>
            <p className="text-sm text-text-muted leading-relaxed">
              AI-powered flashcards, quizzes, and mock exams — built to help you ace every exam.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 mt-1">
              {/* X / Twitter */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on X"
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-default text-text-muted hover:text-text-primary hover:border-border-strong transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram"
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-default text-text-muted hover:text-[#FF5392] hover:border-[#FF5392]/30 transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link Columns */}
          <div className="flex flex-wrap gap-12">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="flex flex-col gap-3.5">
                <p className="text-xs font-semibold uppercase tracking-widest text-text-faint">
                  {category}
                </p>
                <ul className="flex flex-col gap-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-text-secondary hover:text-[#FF5392] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 pt-8 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-faint">
            © {new Date().getFullYear()} Papermind. All rights reserved.
          </p>
          <p className="text-xs text-text-faint">
            A Bhyte Software Company
          </p>
        </div>
      </div>
    </footer>
  );
}
