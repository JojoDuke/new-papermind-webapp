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
