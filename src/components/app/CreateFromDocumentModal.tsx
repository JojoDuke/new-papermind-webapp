'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthToken } from '@convex-dev/auth/react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import toast from 'react-hot-toast';
import { openPricingModal } from '@/components/app/pricing-modal-context';
import { isUpgradeRequiredError } from '@/lib/upgrade-required';
import type { Id } from '../../../convex/_generated/dataModel';

type Document = {
  _id: Id<'documents'>;
  name: string;
  uploadedAt: number;
  pageCount?: number;
};

type CreateFromDocumentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: 'quiz' | 'study-guide' | 'flashcard';
  documents: Document[] | undefined;
  initialDocumentId?: Id<'documents'> | null;
};

const quizQuestionCountMap = { low: '5', medium: '8', high: '12' };
const studyGuideCountMap = { low: '3', medium: '4', high: '5' };
const flashcardCountMap = { low: '5', medium: '8', high: '12' };

function stripPdfExtension(name: string) {
  return name.replace(/\.pdf$/i, '');
}

export function CreateFromDocumentModal({
  isOpen,
  onClose,
  mode,
  documents,
  initialDocumentId,
}: CreateFromDocumentModalProps) {
  const router = useRouter();
  const authToken = useAuthToken();

  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [selectedDocId, setSelectedDocId] = useState<Id<'documents'> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const documentQuota = useQuery(
    api.usageQuota.getDocumentQuota,
    selectedDocId ? { documentId: selectedDocId } : 'skip',
  );

  const [quizName, setQuizName] = useState('');
  const [deckName, setDeckName] = useState('');
  const [pageRangeFrom, setPageRangeFrom] = useState(1);
  const [pageRangeTo, setPageRangeTo] = useState(10);
  const [questionCount, setQuestionCount] = useState<'low' | 'medium' | 'high'>('low');
  const [guideCount, setGuideCount] = useState<'low' | 'medium' | 'high'>('low');
  const [cardCount, setCardCount] = useState<'low' | 'medium' | 'high'>('low');
  const [cardTypes, setCardTypes] = useState({ termDef: true, qa: true });

  const selectedDoc = documents?.find((d) => d._id === selectedDocId);
  const wasOpenRef = useRef(false);

  const resetForm = () => {
    setStep('select');
    setSelectedDocId(null);
    setQuizName('');
    setDeckName('');
    setPageRangeFrom(1);
    setPageRangeTo(10);
    setQuestionCount('low');
    setGuideCount('low');
    setCardCount('low');
    setCardTypes({ termDef: true, qa: true });
    setIsGenerating(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const applyDocumentDefaults = (doc: Document) => {
    setPageRangeFrom(1);
    setPageRangeTo(doc.pageCount ? Math.min(10, doc.pageCount) : 10);
    if (mode === 'quiz') {
      setQuizName(`${stripPdfExtension(doc.name)} Quiz`);
    } else if (mode === 'flashcard') {
      setDeckName(stripPdfExtension(doc.name));
    }
  };

  const applyInitialDocument = (docId: Id<'documents'>) => {
    const doc = documents?.find((d) => d._id === docId);
    if (!doc) return;
    setSelectedDocId(docId);
    applyDocumentDefaults(doc);
    setStep('configure');
  };

  useEffect(() => {
    const justOpened = isOpen && !wasOpenRef.current;
    const justClosed = !isOpen && wasOpenRef.current;
    wasOpenRef.current = isOpen;

    if (justClosed) {
      resetForm();
      return;
    }

    if (!justOpened) return;

    if (initialDocumentId) {
      applyInitialDocument(initialDocumentId);
    } else {
      setStep('select');
      setSelectedDocId(null);
      setQuizName('');
      setDeckName('');
      setPageRangeFrom(1);
      setPageRangeTo(10);
      setQuestionCount('low');
      setGuideCount('low');
      setCardCount('low');
      setCardTypes({ termDef: true, qa: true });
    }
  }, [isOpen, initialDocumentId, documents, mode]);

  useEffect(() => {
    if (!isOpen || !initialDocumentId || step !== 'select') return;
    applyInitialDocument(initialDocumentId);
  }, [isOpen, initialDocumentId, documents, step]);

  const handleSelectDocument = (doc: Document) => {
    setSelectedDocId(doc._id);
    applyDocumentDefaults(doc);
    setStep('configure');
  };

  const handleGenerateQuiz = async () => {
    if (!selectedDocId || !selectedDoc) return;
    if (!quizName.trim()) {
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
          deckName: quizName.trim(),
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
      handleClose();
      router.push(`/dashboard/quizzes/${deckId}`);
      toast.success('Quiz generated.');
    } catch (e) {
      if (isUpgradeRequiredError(e)) {
        onClose();
        openPricingModal({ title: 'Upgrade to generate more quizzes', subtitle: 'Free accounts are limited. Upgrade to keep generating.' });
      } else {
        toast.error(e instanceof Error ? e.message : 'Could not generate quiz.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateStudyGuides = async () => {
    if (!selectedDocId) return;
    if (!authToken) {
      toast.error('Please sign in again.');
      return;
    }

    const countMap = { low: 3, medium: 4, high: 5 };

    setIsGenerating(true);
    try {
      const res = await fetch('/api/study-guides/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          documentId: selectedDocId,
          guideCount: countMap[guideCount],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error ?? 'Generation failed');
      }
      const { count } = await res.json();
      handleClose();
      toast.success(`${count} study guide${count === 1 ? '' : 's'} created.`);
    } catch (e) {
      if (isUpgradeRequiredError(e)) {
        onClose();
        openPricingModal({ title: 'Upgrade to generate more study guides', subtitle: 'Free accounts are limited. Upgrade to keep generating.' });
      } else {
        toast.error(e instanceof Error ? e.message : 'Could not generate study guides.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!selectedDocId || !selectedDoc) return;
    if (!deckName.trim()) {
      toast.error('Please give your deck a name.');
      return;
    }
    if (!cardTypes.termDef && !cardTypes.qa) {
      toast.error('Select at least one flashcard type.');
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
      const res = await fetch('/api/flashcards/generate', {
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
          cardCountPreset: cardCount,
          includeTermDef: cardTypes.termDef,
          includeQa: cardTypes.qa,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error ?? 'Generation failed');
      }
      const { deckId } = await res.json();
      handleClose();
      router.push(`/dashboard/flashcards/${deckId}`);
      toast.success('Flashcards generated.');
    } catch (e) {
      if (isUpgradeRequiredError(e)) {
        onClose();
        openPricingModal({ title: 'Upgrade to generate more flashcards', subtitle: 'Free accounts are limited. Upgrade to keep generating.' });
      } else {
        toast.error(e instanceof Error ? e.message : 'Could not generate flashcards.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const isOverQuota = (): boolean => {
    if (!documentQuota || documentQuota.isPaid) return false;
    if (mode === 'flashcard') {
      const { used, limit } = documentQuota.flashcardDecks;
      return limit !== null && used >= limit;
    }
    if (mode === 'quiz') {
      const { used, limit } = documentQuota.quizDecks;
      return limit !== null && used >= limit;
    }
    if (mode === 'study-guide') {
      const { used, limit } = documentQuota.studyGuides;
      return limit !== null && used >= limit;
    }
    return false;
  };

  const handleGenerate = () => {
    if (isOverQuota()) {
      const titles: Record<typeof mode, string> = {
        flashcard: 'Upgrade to generate more flashcards',
        quiz: 'Upgrade to generate more quizzes',
        'study-guide': 'Upgrade to generate more study guides',
      };
      onClose();
      openPricingModal({
        title: titles[mode],
        subtitle: "You've used your free generation for this document. Upgrade for unlimited access.",
      });
      return;
    }
    if (mode === 'quiz') {
      void handleGenerateQuiz();
    } else if (mode === 'flashcard') {
      void handleGenerateFlashcards();
    } else {
      void handleGenerateStudyGuides();
    }
  };

  const handlePresetClick = (level: 'low' | 'medium' | 'high') => {
    if (level === 'low') {
      if (mode === 'quiz') setQuestionCount(level);
      else if (mode === 'flashcard') setCardCount(level);
      else setGuideCount(level);
      return;
    }
    openPricingModal({
      title: 'Upgrade to unlock',
      subtitle:
        mode === 'quiz'
          ? 'Medium and high question counts are available on paid plans.'
          : mode === 'flashcard'
            ? 'Medium and high card counts are available on paid plans.'
            : 'Medium and high guide counts are available on paid plans.',
    });
  };

  if (!isOpen) return null;

  const title =
    step === 'select'
      ? 'Select a document'
      : mode === 'quiz'
        ? 'Create quiz'
        : mode === 'flashcard'
          ? 'Create flashcards'
          : 'Create study guides';

  const subtitle =
    step === 'select'
      ? mode === 'quiz'
        ? 'Choose which document to generate a quiz from.'
        : mode === 'flashcard'
          ? 'Choose which document to generate flashcards from.'
          : 'Choose which document to generate study guides from.'
      : mode === 'quiz'
        ? 'Set your quiz options below.'
        : mode === 'flashcard'
          ? 'Set your flashcard options below.'
          : 'Choose how many study guides to generate.';

  const presetMap =
    mode === 'quiz'
      ? quizQuestionCountMap
      : mode === 'flashcard'
        ? flashcardCountMap
        : studyGuideCountMap;
  const presetValue =
    mode === 'quiz' ? questionCount : mode === 'flashcard' ? cardCount : guideCount;
  const presetLabel =
    mode === 'quiz'
      ? 'Number of questions'
      : mode === 'flashcard'
        ? 'Number of flashcards'
        : 'Number of guides';
  const usesPageRange = mode === 'quiz' || mode === 'flashcard';
  const needsName = mode === 'quiz' || mode === 'flashcard';
  const nameValue = mode === 'quiz' ? quizName : deckName;
  const setNameValue = mode === 'quiz' ? setQuizName : setDeckName;
  const nameLabel = mode === 'quiz' ? 'Quiz name' : 'Deck name';
  const namePlaceholder = mode === 'quiz' ? 'Name this quiz' : 'Name this deck';
  const generateLabel =
    mode === 'quiz'
      ? 'Generate quiz'
      : mode === 'flashcard'
        ? 'Generate flashcards'
        : 'Generate study guides';
  const generateButtonClass =
    mode === 'quiz'
      ? 'bg-purple-500 hover:bg-purple-600'
      : mode === 'flashcard'
        ? 'bg-pink-500 hover:bg-pink-600'
        : 'bg-green-500 hover:bg-green-600';
  const activePresetClass =
    mode === 'quiz'
      ? 'bg-purple-500 text-white border-purple-500'
      : mode === 'flashcard'
        ? 'bg-pink-500 text-white border-pink-500'
        : 'bg-green-500 text-white border-green-500';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-surface-card rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[min(90dvh,720px)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-border-subtle shrink-0">
          <div>
            <h2 className="text-lg font-bold font-serif text-text-primary">{title}</h2>
            <p className="text-sm text-text-muted mt-1">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-subtle hover:bg-border-default transition-colors text-text-muted cursor-pointer shrink-0"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          {step === 'select' && (
            <>
              {documents === undefined && (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-xl bg-surface-subtle animate-pulse" />
                  ))}
                </div>
              )}

              {documents && documents.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-sm font-medium text-text-secondary mb-1">No documents yet</p>
                  <p className="text-xs text-text-faint mb-4">
                    Upload a PDF on the dashboard first, then come back to create from it.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      router.push('/dashboard');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#FF5392] text-[#FF5392] text-sm font-semibold hover:bg-pink-50 transition-colors cursor-pointer"
                  >
                    Go to dashboard
                  </button>
                </div>
              )}

              {documents && documents.length > 0 && (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <button
                      key={doc._id}
                      type="button"
                      onClick={() => handleSelectDocument(doc)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-border-default hover:border-pink-300 hover:bg-pink-50/50 dark:hover:bg-pink-950/20 transition-colors text-left cursor-pointer"
                    >
                      <div className="relative w-10 h-12 shrink-0">
                        <svg className="w-10 h-12 text-pink-200" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                          <path d="M14 2v6h6" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-text-primary truncate">{doc.name}</p>
                        <p className="text-xs text-text-faint mt-0.5">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                          {doc.pageCount ? ` · ${doc.pageCount} pages` : ''}
                        </p>
                      </div>
                      <svg className="w-4 h-4 text-text-faint shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 'configure' && selectedDoc && (
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setStep('select')}
                className="self-start flex items-center gap-1.5 text-sm text-text-faint hover:text-text-secondary cursor-pointer"
              >
                ← Change document
              </button>

              <div className="rounded-xl border border-border-subtle bg-surface-subtle px-4 py-3">
                <p className="text-xs text-text-faint mb-0.5">Document</p>
                <p className="text-sm font-medium text-text-primary truncate">{selectedDoc.name}</p>
              </div>

              {needsName && (
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-text-secondary">{nameLabel}</span>
                  <input
                    type="text"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    maxLength={80}
                    placeholder={namePlaceholder}
                    className={`w-full px-3 py-2.5 rounded-lg border border-border-default bg-surface-card text-sm text-text-primary placeholder:text-text-faint focus:outline-none focus:ring-2 ${
                      mode === 'quiz' ? 'focus:ring-purple-300' : 'focus:ring-pink-300'
                    }`}
                  />
                </label>
              )}

              {usesPageRange && (
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] text-text-faint uppercase">From page</span>
                    <input
                      type="number"
                      min={1}
                      value={pageRangeFrom}
                      onChange={(e) =>
                        setPageRangeFrom(Math.max(1, parseInt(e.target.value, 10) || 1))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-border-default bg-surface-card text-sm text-text-primary"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] text-text-faint uppercase">To page</span>
                    <input
                      type="number"
                      min={1}
                      value={pageRangeTo}
                      onChange={(e) =>
                        setPageRangeTo(Math.max(1, parseInt(e.target.value, 10) || 1))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-border-default bg-surface-card text-sm text-text-primary"
                    />
                  </label>
                </div>
              )}

              {mode === 'flashcard' && (
                <div>
                  <p className="text-xs font-medium text-text-secondary mb-3">Flashcard types</p>
                  <div className="flex flex-col gap-2.5">
                    {[
                      { key: 'termDef', label: 'term & definition' },
                      { key: 'qa', label: 'question & answer' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer group">
                        <div
                          onClick={() =>
                            setCardTypes((prev) => ({
                              ...prev,
                              [key]: !prev[key as keyof typeof prev],
                            }))
                          }
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-all cursor-pointer ${
                            cardTypes[key as keyof typeof cardTypes]
                              ? 'bg-pink-500 border-pink-500'
                              : 'bg-surface-card border-border-strong group-hover:border-pink-400'
                          }`}
                        >
                          {cardTypes[key as keyof typeof cardTypes] && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm text-text-secondary select-none">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-text-secondary mb-2">{presetLabel}</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handlePresetClick(level)}
                      className={`py-2 rounded-lg text-xs font-medium border cursor-pointer capitalize ${
                        presetValue === level
                          ? activePresetClass
                          : 'bg-surface-card text-text-muted border-border-default'
                      }`}
                    >
                      {level} ({presetMap[level]})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {step === 'configure' && (
          <div className="px-6 py-4 border-t border-border-subtle shrink-0">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={
                isGenerating ||
                (needsName && !nameValue.trim()) ||
                (mode === 'flashcard' && !cardTypes.termDef && !cardTypes.qa)
              }
              className={`w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 ${generateButtonClass}`}
            >
              {isGenerating && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isGenerating ? 'Generating…' : generateLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
