'use client';

import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { ProtectedRoute } from '@/components/app/ProtectedRoute';
import { DashboardSidebar } from '@/components/app/DashboardSidebar';
import { StudyDeckCard } from '@/components/app/StudyDeckCard';
import toast from 'react-hot-toast';
import type { Id } from '../../../../../../convex/_generated/dataModel';

export default function AllFlashcardDecksPage() {
  const flashcardDecks = useQuery(api.flashcards.listMyFlashcardDecks);
  const user = useQuery(api.auth.currentUser);
  const deleteFlashcardDeck = useMutation(api.flashcards.deleteFlashcardDeck);

  const handleDeleteDeck = async (deckId: Id<'flashcardDecks'>) => {
    try {
      await deleteFlashcardDeck({ deckId });
      toast.success('Deck deleted.');
    } catch {
      toast.error('Failed to delete deck. Please try again.');
      throw new Error('Delete failed');
    }
  };

  const loading = flashcardDecks === undefined;

  const userInitial =
    user?.name?.trim().charAt(0).toUpperCase() ||
    user?.email?.trim().charAt(0).toUpperCase() ||
    '?';

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <DashboardSidebar />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center gap-3 mb-8">
            <Link
              href="/dashboard/study-decks"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Back to Study Decks"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">All Flashcard Decks</h1>
          </div>

          {loading ? (
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-pink-400 rounded-full animate-spin" />
              Loading decks…
            </div>
          ) : !flashcardDecks?.length ? (
            <div className="rounded-2xl bg-gray-200 px-6 py-16 text-center text-sm text-gray-600 max-w-2xl">
              No flashcard decks yet. Generate a set from a document on the homepage.
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(158px,158px))] gap-6">
              {flashcardDecks.map((deck) => (
                <StudyDeckCard
                  key={deck._id}
                  deckId={deck._id}
                  title={deck.deckName}
                  cardCount={deck.cardCount}
                  progress={0}
                  userInitial={userInitial}
                  onDelete={() => handleDeleteDeck(deck._id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
