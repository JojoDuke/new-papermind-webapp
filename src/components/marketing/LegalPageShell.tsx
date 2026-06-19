import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import type { ReactNode } from 'react';

type LegalPageShellProps = {
  title: string;
  lastUpdated: string;
  children: ReactNode;
};

export function LegalPageShell({ title, lastUpdated, children }: LegalPageShellProps) {
  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50/50 via-white to-purple-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-purple-950/20 relative overflow-x-hidden">
      <Navbar />
      <main className="max-w-[800px] mx-auto px-4 md:px-0 py-16 md:py-24">
        <header className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FF5392] mb-3">Legal</p>
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-text-primary mb-4 tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-text-muted font-sans">Last updated: {lastUpdated}</p>
        </header>
        <article className="prose-legal font-sans text-text-secondary leading-relaxed space-y-6">
          {children}
        </article>
      </main>
      <Footer />
    </div>
  );
}
