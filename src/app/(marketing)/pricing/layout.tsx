import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/site';

export const metadata: Metadata = pageMetadata('/pricing', {
  title: 'Pricing - Papermind',
  description:
    'Simple pricing for AI-powered flashcards, quizzes, and mock exams. Start free, upgrade when you are ready.',
});

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
