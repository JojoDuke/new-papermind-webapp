'use client';

import { useState, Suspense, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import type { Id } from '../../../../../../convex/_generated/dataModel';
import toast from 'react-hot-toast';
import { openPricingModal } from '@/components/app/pricing-modal-context';
import { useDashboardNav } from '@/components/app/dashboard-nav-context';
import { dashboardMainClass } from '@/components/app/dashboard-page-styles';

type ExamType = 'nclex-rn';

const EXAM_TYPES: {
  id: ExamType;
  label: string;
  badge: string;
  description: string;
  iconPath: string;
}[] = [
  {
    id: 'nclex-rn',
    label: 'NCLEX-RN',
    badge: 'Nursing',
    description: 'Timed NCLEX-RN practice exams from Papermind\'s curated question bank',
    iconPath:
      'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  },
];

const FADE_MS = 300;

const NCLEX_INSTRUCTIONS = [
  {
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    text: 'Questions are pulled from Papermind\'s curated NCLEX-RN question bank — no uploads needed.',
  },
  {
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    text: 'Your exam is timed. The clock starts when you begin the session.',
  },
  {
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    text: 'You won\'t see whether answers are right or wrong until you submit — just like the real exam.',
  },
  {
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    text: 'Move freely between questions and change your answers anytime before submitting.',
  },
  {
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    text: 'A score of 75% or higher counts as passing.',
  },
];

function NclexInstructionsView({
  visible,
  onStart,
  isCreating,
}: {
  visible: boolean;
  onStart: () => void;
  isCreating: boolean;
}) {
  const examType = EXAM_TYPES[0];

  return (
    <div
      className={`flex flex-1 flex-col min-h-0 overflow-hidden transition-opacity duration-300 ease-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-1 min-h-0 items-start justify-center overflow-hidden pt-2 sm:pt-4">
        <div className="w-full max-w-md flex flex-col items-center text-center">
          <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={examType.iconPath} />
            </svg>
          </div>

          <div className="flex items-center justify-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-text-primary">{examType.label}</h2>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
              {examType.badge}
            </span>
          </div>
          <p className="text-sm text-text-muted mb-4 max-w-sm">
            Here&apos;s what to expect before you start your mock exam.
          </p>

          <ul className="w-full space-y-2.5 text-left mb-4">
            {NCLEX_INSTRUCTIONS.map(({ icon, text }) => (
              <li key={text} className="flex items-start gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-surface-subtle border border-border-default flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-text-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                  </svg>
                </span>
                <p className="text-sm text-text-secondary leading-snug pt-1">{text}</p>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={onStart}
            disabled={isCreating}
            className="w-full flex items-center justify-center py-2.5 rounded-xl bg-[#FF5392] hover:bg-[#FF5392]/90 text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            {isCreating ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating exam…
              </span>
            ) : (
              "Let's get started"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(ms: number) {
  return new Date(ms).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function NclexRnContent() {
  const router = useRouter();
  const sessions = useQuery(api.mockExams.listMyMockExamSessions, { examType: 'nclex-rn' });
  const deleteSession = useMutation(api.mockExams.deleteMockExamSession);

  const handleDelete = async (sessionId: Id<'mockExamSessions'>) => {
    try {
      await deleteSession({ sessionId });
      toast.success('Exam deleted.');
    } catch {
      toast.error('Failed to delete exam.');
    }
  };

  if (sessions === undefined) {
    return (
      <div className="flex flex-wrap gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-full sm:w-72 h-44 rounded-2xl bg-surface-subtle animate-pulse" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-5 mt-8">
      {sessions.map((session) => {
        const isComplete = !!session.completedAt;
        const isInProgress = !!session.startedAt && !session.completedAt;
        const scoreColor =
          session.scorePercent !== undefined
            ? session.scorePercent >= 75
              ? 'text-emerald-600 dark:text-emerald-400'
              : session.scorePercent >= 50
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-red-500 dark:text-red-400'
            : '';

        return (
          <div
            key={session._id}
            className="w-full sm:w-72 bg-surface-card border border-border-default rounded-2xl p-5 hover:shadow-md dark:hover:shadow-black/20 transition-shadow flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(session._id)}
                className="text-text-faint hover:text-red-400 dark:hover:text-red-400 transition-colors cursor-pointer"
                aria-label="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary leading-snug mb-1 line-clamp-2">{session.title}</p>
              <p className="text-xs text-text-faint">{session.questions.length} questions · {session.timeLimitMinutes} min</p>
              <p className="text-xs text-text-faint mt-0.5">{formatDate(session.createdAt)}</p>
            </div>

            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                isComplete
                  ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                  : isInProgress
                  ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                  : 'bg-surface-subtle text-text-muted'
              }`}>
                {isComplete ? 'Completed' : isInProgress ? 'In progress' : 'Not started'}
              </span>
              {isComplete && session.scorePercent !== undefined && (
                <span className={`text-sm font-bold ${scoreColor}`}>{session.scorePercent}%</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => router.push(`/dashboard/mock-exams/${session._id}`)}
              className="w-full py-2 rounded-xl border border-border-default text-sm font-medium text-text-secondary hover:border-[#FF5392] hover:text-[#FF5392] hover:bg-pink-50 dark:hover:bg-pink-950/20 transition-all cursor-pointer"
            >
              {isComplete ? 'Review results' : isInProgress ? 'Continue exam' : 'Start exam'}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function MockExamsContent() {
  const router = useRouter();
  const createMockExam = useMutation(api.mockExams.createMockExamFromBank);
  const { setTopBarBack } = useDashboardNav();
  const [screen, setScreen] = useState<'hub' | 'instructions'>('hub');
  const [hubVisible, setHubVisible] = useState(true);
  const [instructionsVisible, setInstructionsVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const startNewMockExam = async () => {
    setIsCreating(true);
    try {
      const { sessionId } = await createMockExam({ examType: 'nclex-rn' });
      toast.success('Mock exam created!');
      router.push(`/dashboard/mock-exams/${sessionId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create exam';
      if (message.includes('upgrade_required')) {
        openPricingModal({
          title: 'Unlock unlimited mock exams',
          subtitle: message.replace(/^upgrade_required:\s*/, ''),
        });
        return;
      }
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  const closeInstructions = useCallback(() => {
    setInstructionsVisible(false);
    window.setTimeout(() => {
      setScreen('hub');
      requestAnimationFrame(() => setHubVisible(true));
    }, FADE_MS);
  }, []);

  const openInstructions = () => {
    setHubVisible(false);
    window.setTimeout(() => {
      setScreen('instructions');
      requestAnimationFrame(() => setInstructionsVisible(true));
    }, FADE_MS);
  };

  useEffect(() => {
    if (screen === 'instructions') {
      setTopBarBack({ onClick: closeInstructions });
    } else {
      setTopBarBack(null);
    }
    return () => setTopBarBack(null);
  }, [screen, closeInstructions, setTopBarBack]);

  return (
    <main
      className={`${dashboardMainClass} bg-surface-page flex flex-col ${
        screen === 'instructions' ? 'overflow-hidden' : 'overflow-y-auto'
      }`}
    >
      {screen === 'hub' && (
        <div
          className={`flex flex-col transition-opacity duration-300 ease-out ${
            hubVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 md:mb-8 shrink-0">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-text-primary mb-1">Mock Exams</h1>
              <p className="text-sm text-text-muted">
                Full-length timed practice exams from Papermind&apos;s curated question bank
              </p>
            </div>
            <button
              type="button"
              onClick={startNewMockExam}
              disabled={isCreating}
              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FF5392] text-white text-sm font-semibold hover:bg-[#FF5392]/90 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <span className="text-base leading-none">+</span>
                  New mock exam
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            {EXAM_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={openInstructions}
                className="relative flex flex-col w-44 h-44 sm:w-48 sm:h-48 p-5 rounded-2xl border-2 text-left transition-all cursor-pointer border-border-default bg-surface-card hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/40 dark:hover:bg-purple-950/20"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-purple-100 dark:bg-purple-950/40">
                  <svg className="w-6 h-6 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={type.iconPath} />
                  </svg>
                </div>
                <div className="flex-1 flex flex-col justify-end min-w-0 mt-3">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="text-sm font-semibold text-text-primary">{type.label}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-surface-subtle text-text-muted">
                      {type.badge}
                    </span>
                  </div>
                  <p className="text-xs leading-snug line-clamp-3 text-text-faint">{type.description}</p>
                </div>
              </button>
            ))}
          </div>

          <NclexRnContent />
        </div>
      )}

      {screen === 'instructions' && (
        <NclexInstructionsView
          visible={instructionsVisible}
          onStart={startNewMockExam}
          isCreating={isCreating}
        />
      )}
    </main>
  );
}

export default function MockExamsPage() {
  return (
    <Suspense fallback={null}>
      <MockExamsContent />
    </Suspense>
  );
}
