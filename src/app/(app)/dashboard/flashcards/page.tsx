'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { ProtectedRoute } from '@/components/app/ProtectedRoute';
import { DashboardSidebar } from '@/components/app/DashboardSidebar';
import { StudyDeckCard } from '@/components/app/StudyDeckCard';
import toast from 'react-hot-toast';
import type { Id } from '../../../../../convex/_generated/dataModel';

export default function FlashcardsPage() {
  const user = useQuery(api.auth.currentUser);
  const decks = useQuery(api.flashcards.listMyFlashcardDecks);
  const renameDeck = useMutation(api.flashcards.renameFlashcardDeck);
  const deleteDeck = useMutation(api.flashcards.deleteFlashcardDeck);

  const userInitial =
    (user?.name?.trim()[0] || user?.email?.[0] || '?').toUpperCase();

  const handleRename = async (deckId: Id<'flashcardDecks'>, newName: string) => {
    try {
      await renameDeck({ deckId, deckName: newName });
      toast.success('Deck renamed.');
    } catch {
      toast.error('Failed to rename. Please try again.');
    }
  };

  const handleDelete = async (deckId: Id<'flashcardDecks'>) => {
    try {
      await deleteDeck({ deckId });
      toast.success('Deck deleted.');
    } catch {
      toast.error('Failed to delete. Please try again.');
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-8">Flashcards</h1>

          {decks === undefined && (
            <div className="flex flex-wrap gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-[158px] h-48 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          )}

          {decks && decks.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-2 max-w-md">
              <svg className="w-10 h-10 text-gray-200 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-sm font-medium text-gray-600">No flashcard decks yet</p>
              <p className="text-xs text-gray-400">
                Upload a document on the dashboard and generate flashcards to get started.
              </p>
            </div>
          )}

          {decks && decks.length > 0 && (
            <div className="flex flex-wrap gap-6">
              {decks.map((deck) => (
                <StudyDeckCard
                  key={deck._id}
                  deckId={deck._id}
                  title={deck.deckName}
                  cardCount={deck.cardCount}
                  progress={deck.progress}
                  userInitial={userInitial}
                  onRename={(newName) => handleRename(deck._id, newName)}
                  onDelete={() => handleDelete(deck._id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
