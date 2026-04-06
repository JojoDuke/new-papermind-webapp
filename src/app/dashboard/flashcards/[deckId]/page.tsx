'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { useState, useEffect } from 'react';
import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { FlashcardStudyView } from '@/components/FlashcardStudyView';
import Link from 'next/link';

export default function FlashcardDeckPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.deckId as Id<'flashcardDecks'>;
  const [quitOpen, setQuitOpen] = useState(false);

  const data = useQuery(api.flashcards.getDeckWithCards, { deckId });

  const loading = data === undefined;
  const notFound = data === null;

  const openQuit = () => setQuitOpen(true);
  const confirmQuit = () => {
    setQuitOpen(false);
    router.push('/dashboard');
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      if (quitOpen) setQuitOpen(false);
      else if (!notFound) openQuit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [quitOpen, notFound]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <header className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 bg-white">
          <button
            type="button"
            onClick={openQuit}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <button
            type="button"
            onClick={openQuit}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-8 py-4 pb-10">
          {notFound ? (
            <div className="text-center max-w-sm">
              <p className="text-sm text-gray-600 mb-4">This flashcard set could not be found.</p>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-pink-600 hover:text-pink-700"
              >
                Return to dashboard
              </Link>
            </div>
          ) : (
            <FlashcardStudyView
              cards={data?.cards}
              loading={loading}
              deckName={data?.deckName}
            />
          )}
        </main>
      </div>

      {quitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            aria-hidden
            onClick={() => setQuitOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-gray-900">Are you sure you want to quit?</h3>
            <p className="text-xs text-gray-500">
              You can generate a new set from your document anytime from the dashboard.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setQuitOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmQuit}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-lg transition-all cursor-pointer"
              >
                Quit
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
