'use client';

import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { ProtectedRoute } from '@/components/app/ProtectedRoute';
import { DashboardSidebar } from '@/components/app/DashboardSidebar';
import { StudyDeckCard } from '@/components/app/StudyDeckCard';
import toast from 'react-hot-toast';
import type { Id } from '../../../../../convex/_generated/dataModel';

export default function StudyDecksPage() {
  const flashcardDecks = useQuery(api.flashcards.listMyFlashcardDecks);
  const user = useQuery(api.auth.currentUser);
  const deleteFlashcardDeck = useMutation(api.flashcards.deleteFlashcardDeck);
  const renameFlashcardDeck = useMutation(api.flashcards.renameFlashcardDeck);

  const handleDeleteDeck = async (deckId: Id<'flashcardDecks'>) => {
    try {
      await deleteFlashcardDeck({ deckId });
      toast.success('Deck deleted.');
    } catch {
      toast.error('Failed to delete deck. Please try again.');
      throw new Error('Delete failed');
    }
  };

  const handleRenameDeck = async (deckId: Id<'flashcardDecks'>, newName: string) => {
    try {
      await renameFlashcardDeck({ deckId, deckName: newName });
    } catch {
      toast.error('Failed to rename deck. Please try again.');
      throw new Error('Rename failed');
    }
  };

  const loading = flashcardDecks === undefined;
  const hasFlashcards = (flashcardDecks?.length ?? 0) > 0;
  const hasQuizzes = false;
  const hasAnyDeck = hasFlashcards || hasQuizzes;

  const userInitial =
    user?.name?.trim().charAt(0).toUpperCase() ||
    user?.email?.trim().charAt(0).toUpperCase() ||
    '?';

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <DashboardSidebar />

        <main className="flex-1 overflow-y-auto p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-8">Study Decks</h1>

          {loading ? (
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-pink-400 rounded-full animate-spin" />
              Loading decks…
            </div>
          ) : !hasAnyDeck ? (
            <div className="rounded-2xl bg-gray-200 px-6 py-16 text-center text-sm text-gray-600 max-w-2xl">
              No Decks have been generated here yet.
            </div>
          ) : (
            <div className="flex flex-col gap-12 max-w-5xl">
              <section id="flashcard-decks" className="scroll-mt-24">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 className="text-base font-semibold text-gray-800">Flashcard Decks</h2>
                  <Link
                    href="/dashboard/study-decks/flashcard-decks"
                    className="text-xs font-semibold text-blue-600 tracking-wide hover:text-blue-700 transition-colors"
                  >
                    SEE ALL
                  </Link>
                </div>
                {hasFlashcards ? (
                  <div className="flex flex-wrap gap-4">
                    {flashcardDecks!.slice(0, 5).map((deck) => (
                      <StudyDeckCard
                        key={deck._id}
                        deckId={deck._id}
                        title={deck.deckName}
                        cardCount={deck.cardCount}
                        progress={0}
                        userInitial={userInitial}
                        onDelete={() => handleDeleteDeck(deck._id)}
                        onRename={(newName) => handleRenameDeck(deck._id, newName)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-gray-200 px-6 py-10 text-center text-sm text-gray-600 max-w-2xl">
                    No flashcard decks yet. Generate a set from a document on the homepage.
                  </div>
                )}
              </section>

              <section id="quiz-decks" className="scroll-mt-24">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 className="text-base font-semibold text-gray-800">Quiz Decks</h2>
                  <Link
                    href="/dashboard/study-decks#quiz-decks"
                    className="text-xs font-semibold text-blue-600 tracking-wide hover:text-blue-700 transition-colors"
                  >
                    SEE ALL
                  </Link>
                </div>
                <div className="rounded-2xl bg-gray-200 px-6 py-10 text-center text-sm text-gray-600 max-w-2xl">
                  No quiz decks have been generated yet.
                </div>
              </section>

              <section id="study-guides" className="scroll-mt-24">
                <h2 className="text-base font-semibold text-gray-800 mb-4">Study Guides</h2>
                <div className="rounded-2xl bg-gray-200 px-6 py-10 text-center text-sm text-gray-600 max-w-2xl">
                  Study guides will appear here once available.
                </div>
              </section>

              <section id="mock-exams" className="scroll-mt-24">
                <h2 className="text-base font-semibold text-gray-800 mb-4">Mock Exams</h2>
                <div className="rounded-2xl bg-gray-200 px-6 py-10 text-center text-sm text-gray-600 max-w-2xl">
                  Mock exams will appear here once available.
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
