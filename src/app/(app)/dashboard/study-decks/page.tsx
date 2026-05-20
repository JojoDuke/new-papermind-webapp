'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { ProtectedRoute } from '@/components/app/ProtectedRoute';
import { DashboardSidebar } from '@/components/app/DashboardSidebar';
import { StudyDeckCard } from '@/components/app/StudyDeckCard';
import toast from 'react-hot-toast';
import type { Id } from '../../../../../convex/_generated/dataModel';

export default function StudyDecksPage() {
  const flashcardDecks = useQuery(api.flashcards.listMyFlashcardDecks);
  const studyGuides = useQuery(api.studyGuides.listMyStudyGuides);
  const user = useQuery(api.auth.currentUser);
  const deleteFlashcardDeck = useMutation(api.flashcards.deleteFlashcardDeck);
  const renameFlashcardDeck = useMutation(api.flashcards.renameFlashcardDeck);
  const deleteStudyGuide = useMutation(api.studyGuides.deleteStudyGuide);
  const [expandedGuideId, setExpandedGuideId] = useState<Id<'studyGuides'> | null>(null);

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

  const handleDeleteStudyGuide = async (guideId: Id<'studyGuides'>) => {
    try {
      await deleteStudyGuide({ guideId });
      toast.success('Study guide deleted.');
    } catch {
      toast.error('Failed to delete. Please try again.');
    }
  };

  const loading = flashcardDecks === undefined || studyGuides === undefined;
  const hasFlashcards = (flashcardDecks?.length ?? 0) > 0;
  const hasQuizzes = false;
  const hasStudyGuides = (studyGuides?.length ?? 0) > 0;
  const hasAnyDeck = hasFlashcards || hasQuizzes || hasStudyGuides;

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
                {hasStudyGuides ? (
                  <div className="flex flex-col gap-3 max-w-3xl">
                    {studyGuides!.slice(0, 6).map((guide) => (
                      <div key={guide._id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                        {/* Guide header */}
                        <button
                          onClick={() => setExpandedGuideId(expandedGuideId === guide._id ? null : guide._id)}
                          className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{guide.title}</p>
                            <p className="text-xs text-gray-400 truncate">From: {guide.documentName}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs text-gray-400 hidden sm:block">
                              {new Date(guide.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </span>
                            <svg
                              className={`w-4 h-4 text-gray-400 transition-transform ${expandedGuideId === guide._id ? 'rotate-180' : ''}`}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>

                        {/* Expanded content */}
                        {expandedGuideId === guide._id && (
                          <div className="border-t border-gray-100 px-5 py-5">
                            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                              {guide.content}
                            </div>
                            <div className="flex justify-end mt-4">
                              <button
                                onClick={() => handleDeleteStudyGuide(guide._id)}
                                className="text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-gray-100 px-6 py-10 text-center text-sm text-gray-500 max-w-2xl">
                    Study guides are automatically created when you upload a document.
                  </div>
                )}
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
