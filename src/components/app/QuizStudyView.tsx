'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';

export type QuizQuestion = {
  _id: string;
  question: string;
  correctAnswer: string;
  distractor1: string;
  distractor2: string;
  order: number;
};

type QuizStudyViewProps = {
  questions: QuizQuestion[] | undefined;
  loading: boolean;
  deckId?: Id<'quizDecks'>;
  deckName?: string;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function QuizStudyView({ questions, loading, deckId, deckName }: QuizStudyViewProps) {
  const saveSession = useMutation(api.progress.saveQuizSession);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState<{ correct: number; total: number } | null>(null);

  const outerCls =
    'w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col min-h-[520px]';

  if (loading) {
    return (
      <div className={outerCls}>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-purple-400 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading quiz…</p>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className={outerCls}>
        <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
          No questions in this quiz.
        </div>
      </div>
    );
  }

  if (finished && finalScore) {
    const pct = Math.round((finalScore.correct / finalScore.total) * 100);
    return (
      <div className={outerCls}>
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8 py-10">
          <span className="text-6xl font-bold text-gray-900 tabular-nums">{pct}%</span>
          <p className="text-sm text-gray-500">
            {finalScore.correct} / {finalScore.total} correct
          </p>
          <button
            type="button"
            onClick={() => {
              setIdx(0);
              setSelected(null);
              setAnswered(false);
              setCorrectCount(0);
              setFinished(false);
              setFinalScore(null);
            }}
            className="px-8 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const q = questions[idx];
  const options = shuffle([q.correctAnswer, q.distractor1, q.distractor2]);
  const progress = (idx + (answered ? 1 : 0)) / questions.length;

  const finishQuiz = async (totalCorrect: number) => {
    const total = questions.length;
    setFinalScore({ correct: totalCorrect, total });
    setFinished(true);
    if (deckId) {
      try {
        await saveSession({ deckId, correctCount: totalCorrect, totalCount: total });
      } catch {
        // non-blocking
      }
    }
  };

  const handleSubmit = () => {
    if (!selected || answered) return;
    const correct = selected === q.correctAnswer;
    setWasCorrect(correct);
    setAnswered(true);
    if (correct) setCorrectCount((c) => c + 1);
  };

  const handleNext = async () => {
    const isLast = idx + 1 >= questions.length;
    if (isLast) {
      await finishQuiz(correctCount);
      return;
    }
    setIdx((i) => i + 1);
    setSelected(null);
    setAnswered(false);
    setWasCorrect(false);
  };

  return (
    <div className={outerCls}>
      <div className="px-6 pt-6 pb-2">
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-400 rounded-full transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        {deckName && (
          <p className="text-[11px] text-gray-400 truncate mt-2 text-center" title={deckName}>
            {deckName}
          </p>
        )}
      </div>

      <div className="flex-1 flex flex-col px-6 pb-6 pt-4 gap-5">
        <p className="text-lg font-semibold text-gray-800 text-center leading-snug">
          {q.question}
        </p>

        <div className="flex flex-col gap-2 max-w-md mx-auto w-full">
          {options.map((opt) => {
            let cls =
              'w-full text-left px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer ';
            if (!answered) {
              cls +=
                selected === opt
                  ? 'border-purple-400 bg-purple-50 text-purple-700 font-medium'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50';
            } else if (opt === q.correctAnswer) {
              cls += 'border-green-300 bg-green-50 text-green-800 font-medium';
            } else if (opt === selected) {
              cls += 'border-red-200 bg-red-50 text-red-700';
            } else {
              cls += 'border-gray-200 bg-white text-gray-500';
            }
            return (
              <button
                key={opt}
                type="button"
                disabled={answered}
                onClick={() => setSelected(opt)}
                className={cls}
              >
                {opt}
              </button>
            );
          })}
        </div>

        <div className="max-w-md mx-auto w-full flex gap-2 mt-auto">
          {!answered ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!selected}
              className="flex-1 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 disabled:opacity-40 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Submit
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              {idx + 1 >= questions.length ? 'See results' : 'Next →'}
            </button>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 tabular-nums">
          {idx + 1} / {questions.length}
        </p>
      </div>
    </div>
  );
}
