'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { useState, useEffect } from 'react';
import { api } from '../../../../../../convex/_generated/api';
import { ProtectedRoute } from '@/components/app/ProtectedRoute';
import { QuizStudyView } from '@/components/app/QuizStudyView';
import Link from 'next/link';
import type { Id } from '../../../../../../convex/_generated/dataModel';

export default function QuizDeckPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params?.deckId as Id<'quizDecks'>;
  const [quitOpen, setQuitOpen] = useState(false);

  const data = useQuery(api.quizzes.getQuizDeckWithQuestions, { deckId });

  const loading = data === undefined;
  const notFound = data === null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      if (quitOpen) setQuitOpen(false);
      else if (!notFound) setQuitOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [quitOpen, notFound]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <header className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
          <button
            type="button"
            onClick={() => setQuitOpen(true)}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={() => setQuitOpen(true)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-8 py-4 pb-10 max-w-2xl mx-auto w-full">
          {notFound ? (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">This quiz could not be found.</p>
              <Link href="/dashboard/quizzes" className="text-sm font-medium text-purple-600">
                Return to quizzes
              </Link>
            </div>
          ) : (
            <QuizStudyView
              questions={data?.questions}
              loading={loading}
              deckId={deckId}
              deckName={data?.deckName}
            />
          )}
        </main>
      </div>

      {quitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setQuitOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Quit this quiz?</h3>
            <p className="text-xs text-gray-500 mb-4">Your progress in this session won&apos;t be saved.</p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setQuitOpen(false)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard/quizzes')}
                className="px-4 py-2 text-sm text-white bg-gray-800 rounded-lg cursor-pointer"
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
