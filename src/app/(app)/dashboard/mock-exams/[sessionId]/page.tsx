'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { ProtectedRoute } from '@/components/app/ProtectedRoute';
import { DashboardAppShell } from '@/components/app/DashboardAppShell';
import { dashboardMainClass } from '@/components/app/dashboard-page-styles';
import type { Id } from '../../../../../../convex/_generated/dataModel';
import toast from 'react-hot-toast';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function MockExamSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as Id<'mockExamSessions'>;

  const session = useQuery(api.mockExams.getMockExamSession, { sessionId });
  const startSession = useMutation(api.mockExams.startMockExamSession);
  const submitAnswers = useMutation(api.mockExams.submitMockExamAnswers);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [shuffledChoices, setShuffledChoices] = useState<string[][]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [examStarted, setExamStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Shuffle answer choices once when session loads
  useEffect(() => {
    if (!session || shuffledChoices.length > 0) return;
    const choices = session.questions.map((q) =>
      shuffle([q.correctAnswer, q.distractor1, q.distractor2, ...(q.distractor3 ? [q.distractor3] : [])])
    );
    setShuffledChoices(choices);
  }, [session, shuffledChoices.length]);

  // Start timer when exam begins
  useEffect(() => {
    if (!examStarted || !session || timeLeft === null) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examStarted]);

  // If session already started (e.g. refresh), resume timer
  useEffect(() => {
    if (!session || examStarted) return;
    if (session.completedAt) return; // already done
    if (session.startedAt) {
      const elapsed = Math.floor((Date.now() - session.startedAt) / 1000);
      const total = session.timeLimitMinutes * 60;
      const remaining = Math.max(0, total - elapsed);
      setTimeLeft(remaining);
      setExamStarted(true);
      // Restore any saved answers
      if (session.answers) {
        const restored: Record<number, string> = {};
        session.answers.forEach((a) => { restored[a.questionIndex] = a.selectedAnswer; });
        setAnswers(restored);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleStart = async () => {
    if (!session) return;
    try {
      await startSession({ sessionId });
      setTimeLeft(session.timeLimitMinutes * 60);
      setExamStarted(true);
    } catch {
      toast.error('Failed to start exam');
    }
  };

  const handleAutoSubmit = () => {
    if (submitting) return;
    toast.error('Time is up! Submitting your answers…', { duration: 4000 });
    doSubmit();
  };

  const doSubmit = async () => {
    if (submitting || !session) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    const answerArray = Object.entries(answers).map(([idx, sel]) => ({
      questionIndex: Number(idx),
      selectedAnswer: sel,
    }));
    try {
      await submitAnswers({ sessionId, answers: answerArray });
    } catch {
      toast.error('Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (session === undefined) {
    return (
      <ProtectedRoute>
        <DashboardAppShell>
          <main className={`${dashboardMainClass} flex items-center justify-center`}>
            <div className="w-8 h-8 border-2 border-pink-300 border-t-transparent rounded-full animate-spin" />
          </main>
        </DashboardAppShell>
      </ProtectedRoute>
    );
  }

  if (session === null) {
    return (
      <ProtectedRoute>
        <DashboardAppShell>
          <main className={`${dashboardMainClass} flex items-center justify-center`}>
            <div className="text-center">
              <p className="text-gray-500 mb-4">Exam session not found.</p>
              <button onClick={() => router.push('/dashboard/mock-exams')} className="text-[#FF5392] text-sm font-medium cursor-pointer">
                ← Back to mock exams
              </button>
            </div>
          </main>
        </DashboardAppShell>
      </ProtectedRoute>
    );
  }

  // ── Results view ────────────────────────────────────────────────────────
  if (session.completedAt) {
    const score = session.scorePercent ?? 0;
    const passed = score >= 75;
    const correctCount = session.answers
      ? session.answers.filter((a) => session.questions[a.questionIndex]?.correctAnswer === a.selectedAnswer).length
      : 0;

    return (
      <ProtectedRoute>
        <DashboardAppShell>
          <main className={`${dashboardMainClass} flex flex-col`}>
            <button
              type="button"
              onClick={() => router.push('/dashboard/mock-exams')}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 cursor-pointer w-fit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to mock exams
            </button>

            {/* Score banner */}
            <div className={`rounded-2xl p-8 mb-6 text-center ${passed ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
              <p className="text-sm font-semibold uppercase tracking-widest mb-1" style={{ color: passed ? '#059669' : '#dc2626' }}>
                {passed ? '🎉 Passing score' : 'Keep studying'}
              </p>
              <p className="text-6xl font-bold mb-1" style={{ color: passed ? '#059669' : '#dc2626' }}>{score}%</p>
              <p className="text-sm text-gray-600">{correctCount} / {session.questions.length} correct</p>
              <p className="text-xs text-gray-400 mt-1">NCLEX-RN passing threshold is 75%</p>
            </div>

            {/* Question review */}
            <h2 className="text-base font-semibold text-gray-900 mb-4">Question review</h2>
            <div className="space-y-4">
              {session.questions.map((q, idx) => {
                const userAnswer = session.answers?.find((a) => a.questionIndex === idx)?.selectedAnswer ?? null;
                const isCorrect = userAnswer === q.correctAnswer;
                const choices = shuffledChoices[idx] ?? [q.correctAnswer, q.distractor1, q.distractor2];

                return (
                  <div key={idx} className={`rounded-xl border p-5 ${isCorrect ? 'border-emerald-200 bg-emerald-50/40' : 'border-red-200 bg-red-50/40'}`}>
                    <div className="flex items-start gap-2 mb-3">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`}>
                        {isCorrect ? (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </span>
                      <p className="text-sm font-medium text-gray-800">{idx + 1}. {q.question}</p>
                    </div>
                    <div className="space-y-1.5 ml-7">
                      {choices.map((choice) => {
                        const isCorrectChoice = choice === q.correctAnswer;
                        const isUserChoice = choice === userAnswer;
                        return (
                          <div
                            key={choice}
                            className={`text-xs px-3 py-1.5 rounded-lg border ${
                              isCorrectChoice
                                ? 'bg-emerald-100 border-emerald-300 text-emerald-800 font-medium'
                                : isUserChoice && !isCorrectChoice
                                ? 'bg-red-100 border-red-300 text-red-700'
                                : 'bg-white border-gray-200 text-gray-600'
                            }`}
                          >
                            {choice}
                            {isCorrectChoice && <span className="ml-1 font-semibold">✓ Correct</span>}
                            {isUserChoice && !isCorrectChoice && <span className="ml-1">← Your answer</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </main>
        </DashboardAppShell>
      </ProtectedRoute>
    );
  }

  // ── Pre-start screen ─────────────────────────────────────────────────────
  if (!examStarted) {
    return (
      <ProtectedRoute>
        <DashboardAppShell>
          <main className={`${dashboardMainClass} flex items-center justify-center`}>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-12 max-w-md w-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">{session.title}</h1>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-6">
                <span>{session.questions.length} questions</span>
                <span>·</span>
                <span>{session.timeLimitMinutes} min</span>
                <span>·</span>
                <span>NCLEX-RN</span>
              </div>
              <ul className="text-sm text-gray-600 text-left space-y-2 mb-8 bg-gray-50 rounded-xl p-4">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Timer starts when you click Start
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  No feedback until you submit
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Navigate freely between questions
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  75% or higher is a passing score
                </li>
              </ul>
              <button
                type="button"
                onClick={handleStart}
                className="w-full py-3 rounded-xl bg-[#FF5392] text-white font-semibold text-sm hover:bg-[#FF5392]/90 transition-colors cursor-pointer"
              >
                Start exam
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard/mock-exams')}
                className="mt-3 w-full py-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </main>
        </DashboardAppShell>
      </ProtectedRoute>
    );
  }

  // ── Active exam ────────────────────────────────────────────────────────
  const question = session.questions[currentIndex];
  const choices = shuffledChoices[currentIndex] ?? [question.correctAnswer, question.distractor1, question.distractor2];
  const answeredCount = Object.keys(answers).length;
  const isLowTime = timeLeft !== null && timeLeft < 300;

  return (
    <ProtectedRoute>
      <DashboardAppShell>
        <main className={`${dashboardMainClass} flex flex-col max-w-3xl mx-auto`}>
          {/* Exam header */}
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#FF5392]">NCLEX-RN</p>
              <h1 className="text-base font-semibold text-gray-900 truncate">{session.title}</h1>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-sm font-semibold shrink-0 ${isLowTime ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-gray-100 text-gray-700'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-6 shrink-0">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Question {currentIndex + 1} of {session.questions.length}</span>
              <span>{answeredCount} answered</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF5392] rounded-full transition-all"
                style={{ width: `${((currentIndex + 1) / session.questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5 flex-1">
            <p className="text-sm text-gray-500 mb-3">Question {currentIndex + 1}</p>
            <p className="text-gray-900 font-medium leading-relaxed mb-6">{question.question}</p>

            <div className="space-y-3">
              {choices.map((choice, ci) => {
                const label = String.fromCharCode(65 + ci);
                const isSelected = answers[currentIndex] === choice;
                return (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [currentIndex]: choice }))}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#FF5392] bg-pink-50 text-gray-900'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isSelected ? 'bg-[#FF5392] text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {label}
                    </span>
                    <span className="text-sm leading-relaxed pt-0.5">{choice}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            {currentIndex < session.questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => i + 1)}
                className="flex-1 py-2.5 rounded-xl border border-[#FF5392] text-sm text-[#FF5392] font-semibold hover:bg-pink-50 transition-colors cursor-pointer"
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  if (answeredCount < session.questions.length) {
                    const unanswered = session.questions.length - answeredCount;
                    if (!window.confirm(`You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit anyway?`)) return;
                  }
                  doSubmit();
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#FF5392] text-sm text-white font-semibold hover:bg-[#FF5392]/90 transition-colors cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Submit exam'}
              </button>
            )}
          </div>

          {/* Question navigator */}
          <div className="mt-4 flex flex-wrap gap-1.5 shrink-0">
            {session.questions.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  idx === currentIndex
                    ? 'bg-[#FF5392] text-white'
                    : answers[idx]
                    ? 'bg-pink-100 text-pink-700'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </main>
      </DashboardAppShell>
    </ProtectedRoute>
  );
}
