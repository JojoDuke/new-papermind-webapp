'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { ProtectedRoute } from '@/components/app/ProtectedRoute';
import { DashboardSidebar } from '@/components/app/DashboardSidebar';
import { StudyDeckCard } from '@/components/app/StudyDeckCard';
import { useAuthToken } from '@convex-dev/auth/react';
import toast from 'react-hot-toast';
import type { Id } from '../../../../../convex/_generated/dataModel';

const questionCountMap = { low: '5', medium: '8', high: '12' };

function QuizzesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authToken = useAuthToken();
  const user = useQuery(api.auth.currentUser);
  const decks = useQuery(api.quizzes.listMyQuizDecks);
  const documents = useQuery(api.documents.listDocuments);
  const renameDeck = useMutation(api.quizzes.renameQuizDeck);
  const deleteDeck = useMutation(api.quizzes.deleteQuizDeck);

  const [selectedDocId, setSelectedDocId] = useState<Id<'documents'> | null>(null);
  const [deckName, setDeckName] = useState('');
  const [questionCount, setQuestionCount] = useState<'low' | 'medium' | 'high'>('low');
  const [pageRangeFrom, setPageRangeFrom] = useState(1);
  const [pageRangeTo, setPageRangeTo] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);

  const selectedDoc = useQuery(
    api.documents.getDocument,
    selectedDocId ? { documentId: selectedDocId } : 'skip'
  );

  useEffect(() => {
    const docParam = searchParams?.get('documentId');
    if (docParam && documents?.some((d) => d._id === docParam)) {
      const doc = documents.find((d) => d._id === docParam)!;
      setSelectedDocId(docParam as Id<'documents'>);
      setDeckName(`${doc.name.replace(/\.pdf$/i, '')} Quiz`);
    }
  }, [searchParams, documents]);

  const userInitial =
    (user?.name?.trim()[0] || user?.email?.[0] || '?').toUpperCase();

  const handleRename = async (deckId: Id<'quizDecks'>, newName: string) => {
    try {
      await renameDeck({ deckId, deckName: newName });
      toast.success('Quiz renamed.');
    } catch {
      toast.error('Failed to rename. Please try again.');
    }
  };

  const handleDelete = async (deckId: Id<'quizDecks'>) => {
    try {
      await deleteDeck({ deckId });
      toast.success('Quiz deleted.');
    } catch {
      toast.error('Failed to delete. Please try again.');
    }
  };

  const handleGenerate = async () => {
    if (!selectedDocId || !selectedDoc) return;
    if (!deckName.trim()) {
      toast.error('Please give your quiz a name.');
      return;
    }
    if (pageRangeFrom < 1 || pageRangeTo < 1 || pageRangeFrom > pageRangeTo) {
      toast.error('Check your page range.');
      return;
    }
    if (!authToken) {
      toast.error('Please sign in again.');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/quizzes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          documentId: selectedDocId,
          deckName: deckName.trim(),
          pageRangeStart: pageRangeFrom,
          pageRangeEnd: pageRangeTo,
          questionCountPreset: questionCount,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error ?? 'Generation failed');
      }
      const { deckId } = await res.json();
      router.push(`/dashboard/quizzes/${deckId}`);
      toast.success('Quiz generated.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not generate quiz.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Quizzes</h1>
              <p className="text-sm text-gray-500">
                Multiple-choice quizzes generated from your documents
              </p>
            </div>
            {!selectedDocId && (
              <button
                type="button"
                onClick={() => {
                  if (documents && documents.length > 0) {
                    setSelectedDocId(documents[0]._id);
                    setDeckName(`${documents[0].name.replace(/\.pdf$/i, '')} Quiz`);
                  } else {
                    toast.error('Upload a document on the dashboard first.');
                  }
                }}
                className="shrink-0 px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                + New quiz
              </button>
            )}
          </div>

          {selectedDocId ? (
            <div className="max-w-md mb-10">
              <button
                type="button"
                onClick={() => { setSelectedDocId(null); setDeckName(''); }}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-4 cursor-pointer"
              >
                ← Back to quizzes
              </button>
              <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 flex flex-col gap-4">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {selectedDoc?.name ?? 'Loading…'}
                </p>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-600">Quiz name</span>
                  <input
                    type="text"
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                    maxLength={80}
                    placeholder="Name this quiz"
                    className="w-full px-3 py-2.5 rounded-lg border border-purple-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 uppercase">From page</span>
                    <input
                      type="number"
                      min={1}
                      value={pageRangeFrom}
                      onChange={(e) => setPageRangeFrom(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 uppercase">To page</span>
                    <input
                      type="number"
                      min={1}
                      value={pageRangeTo}
                      onChange={(e) => setPageRangeTo(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                    />
                  </label>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">Number of questions</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() =>
                          level === 'low' ? setQuestionCount(level) : setShowUpgradePopup(true)
                        }
                        className={`py-2 rounded-lg text-xs font-medium border cursor-pointer capitalize ${
                          questionCount === level
                            ? 'bg-purple-500 text-white border-purple-500'
                            : 'bg-white text-gray-500 border-gray-200'
                        }`}
                      >
                        {level} ({questionCountMap[level]})
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating || !deckName.trim() || !selectedDoc}
                  className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-semibold text-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isGenerating && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {isGenerating ? 'Generating…' : 'Generate quiz'}
                </button>
              </div>
            </div>
          ) : null}

          {decks === undefined && (
            <div className="flex flex-wrap gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-[158px] h-48 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          )}

          {decks && decks.length === 0 && !selectedDocId && (
            <div className="bg-white border border-gray-200 rounded-2xl p-10 flex flex-col items-center text-center gap-2 max-w-md">
              <p className="text-sm font-medium text-gray-600">No quizzes yet</p>
              <p className="text-xs text-gray-400">
                Create a quiz from one of your uploaded documents.
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
                  cardCount={deck.questionCount}
                  progress={deck.progress}
                  userInitial={userInitial}
                  studyHref={`/dashboard/quizzes/${deck._id}`}
                  onRename={(newName) => handleRename(deck._id, newName)}
                  onDelete={() => handleDelete(deck._id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {showUpgradePopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowUpgradePopup(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-8 max-w-sm mx-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-2">Upgrade to unlock</h2>
            <p className="text-sm text-gray-500 mb-4">
              Medium and high question counts are available on paid plans.
            </p>
            <button
              type="button"
              onClick={() => setShowUpgradePopup(false)}
              className="w-full py-2.5 rounded-xl bg-purple-500 text-white text-sm font-semibold cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}

export default function QuizzesPage() {
  return (
    <Suspense fallback={null}>
      <QuizzesPageContent />
    </Suspense>
  );
}
