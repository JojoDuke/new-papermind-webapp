'use client';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { ProtectedRoute } from '@/components/app/ProtectedRoute';
import { DashboardAppShell } from '@/components/app/DashboardAppShell';
import { CreateFromDocumentModal } from '@/components/app/CreateFromDocumentModal';
import { StudyDeckCard } from '@/components/app/StudyDeckCard';
import toast from 'react-hot-toast';
import type { Id } from '../../../../../convex/_generated/dataModel';

function QuizzesPageContent() {
  const searchParams = useSearchParams();
  const user = useQuery(api.auth.currentUser);
  const decks = useQuery(api.quizzes.listMyQuizDecks);
  const documents = useQuery(api.documents.listDocuments);
  const renameDeck = useMutation(api.quizzes.renameQuizDeck);
  const deleteDeck = useMutation(api.quizzes.deleteQuizDeck);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [initialDocumentId, setInitialDocumentId] = useState<Id<'documents'> | null>(null);

  useEffect(() => {
    const docParam = searchParams?.get('documentId');
    if (docParam && documents?.some((d) => d._id === docParam)) {
      setInitialDocumentId(docParam as Id<'documents'>);
      setShowCreateModal(true);
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

  const openCreateModal = () => {
    if (documents && documents.length === 0) {
      toast.error('Upload a document on the dashboard first.');
      return;
    }
    setInitialDocumentId(null);
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setInitialDocumentId(null);
  };

  return (
    <ProtectedRoute>
      <DashboardAppShell>
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8 flex flex-col min-h-0">
          <div className="flex items-start justify-between gap-4 mb-8 shrink-0">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Quizzes</h1>
              <p className="text-sm text-gray-500">
                Multiple-choice quizzes generated from your documents
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#FF5392] text-[#FF5392] text-sm font-semibold font-sans hover:bg-pink-50 transition-colors cursor-pointer"
            >
              <span className="text-base leading-none">+</span>
              Create quiz from document
            </button>
          </div>

          {decks === undefined && (
            <div className="flex flex-wrap gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-[158px] h-48 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          )}

          {decks && decks.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12 min-h-[420px]">
              <Image
                src="/assets/foxAsleepEmptyState.png"
                alt="Sleeping fox — no quizzes yet"
                width={360}
                height={360}
                priority
                className="object-contain w-full max-w-[320px] h-auto mb-6"
              />
              <h2 className="text-2xl md:text-3xl font-bold font-serif text-gray-900 mb-3">
                No quizzes yet
              </h2>
              <p className="text-sm text-gray-500 font-sans max-w-md leading-relaxed">
                We haven&apos;t created any quizzes for your documents yet. Upload a document
                and generate a quiz to test your understanding.
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

        <CreateFromDocumentModal
          isOpen={showCreateModal}
          onClose={closeCreateModal}
          mode="quiz"
          documents={documents}
          initialDocumentId={initialDocumentId}
        />
      </DashboardAppShell>
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
