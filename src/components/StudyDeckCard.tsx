'use client';

import Link from 'next/link';
import type { Id } from '../../convex/_generated/dataModel';

export type StudyDeckCardProps = {
  deckId: Id<'flashcardDecks'>;
  title: string;
  cardCount: number;
  /** 0–1 study progress; placeholder until tracking exists */
  progress: number;
  userInitial: string;
};

export function StudyDeckCard({
  deckId,
  title,
  cardCount,
  progress,
  userInitial,
}: StudyDeckCardProps) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);

  return (
    <Link
      href={`/dashboard/flashcards/${deckId}`}
      className="group shrink-0 w-[158px] flex flex-col gap-2 cursor-pointer"
    >
      <div className="relative w-full pt-1 pl-1">
        <div
          className="absolute top-2 left-2 right-0 bottom-0 rounded-xl bg-white border border-gray-200/80 shadow-sm"
          aria-hidden
        />
        <div className="relative aspect-square rounded-xl bg-gradient-to-br from-pink-50 via-white to-purple-100 border border-gray-200 shadow-sm overflow-hidden group-hover:shadow-md transition-shadow">
          <div className="absolute inset-0 flex items-center justify-center opacity-40">
            <svg className="w-14 h-14 text-pink-200" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
            </svg>
          </div>
          <div
            className="absolute bottom-1.5 right-1.5 w-8 h-8 rounded-full bg-white border-2 border-white shadow-md flex items-center justify-center text-xs font-semibold text-pink-600"
            title="You"
          >
            {userInitial}
          </div>
        </div>
      </div>

      <div className="px-0.5">
        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-400 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <p className="text-sm font-medium text-gray-800 leading-tight line-clamp-2 min-h-[2.5rem] px-0.5">
        {title}
      </p>

      <div className="flex items-center gap-3 text-[11px] text-gray-400 px-0.5">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
          0
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          {cardCount}
        </span>
      </div>
    </Link>
  );
}
