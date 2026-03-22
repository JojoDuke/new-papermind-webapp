'use client';

import Link from 'next/link';
import Image from 'next/image';

export function Navbar() {
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


          <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-[#FF5392] transition-colors font-sans">
            Pricing
          </Link>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-4 font-sans relative z-10">
          <Link href="/auth" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors px-4 py-2">
            Sign In
          </Link>
          <Link 
            href="/auth" 
            className="bg-[#FF5392] hover:bg-[#FF5392]/90 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95 font-sans"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
