'use client';

import { useEffect, useRef, useState } from 'react';

export type FlashcardStudyCard = {
  _id: string;
  front: string;
  back: string;
  order: number;
  isNew: boolean;
};

type QuizCard = FlashcardStudyCard & { distractors: [string, string] };
type QuestionType = 'mc' | 'free_text';
type QuizQuestion = {
  card: QuizCard;
  type: QuestionType;
  options: string[]; // always 3, shuffled (mc only meaningful)
};

type Phase = 'learn' | 'quiz' | 'requeue' | 'result';
type AnswerState = 'idle' | 'answered' | 'skipped' | 'self_mark';

const BATCH_SIZE = 2;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuizQuestions(cards: QuizCard[]): QuizQuestion[] {
  return cards.map((card) => {
    const hasEnoughDistractors = card.distractors[0] != null && card.distractors[1] != null;
    const type: QuestionType = hasEnoughDistractors && Math.random() < 0.5 ? 'mc' : 'free_text';
    const options = hasEnoughDistractors
      ? shuffle([card.back, card.distractors[0], card.distractors[1]])
      : [];
    return { card, type, options };
  });
}

type FlashcardStudyViewProps = {
  cards: FlashcardStudyCard[] | undefined;
  loading: boolean;
  deckName?: string;
};

function playSuccessSound(higher = false) {
  try {
    const ctx = new AudioContext();
    // Normal: D5 → A5 | Higher: F#5 → C#6
    const notes = higher ? [739.99, 1108.73] : [587.33, 880];
    let time = ctx.currentTime;
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.35, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, time + (i === 0 ? 0.18 : 0.38));
      osc.start(time);
      osc.stop(time + 0.4);
      time += 0.13;
    });
    setTimeout(() => ctx.close(), 1000);
  } catch {
    // silently ignore if Web Audio not available
  }
}

function playErrorSound() {
  try {
    const ctx = new AudioContext();
    const notes = [311.13, 233.08]; // Eb4 → Bb3 (descending minor third)
    let time = ctx.currentTime;
    notes.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.3, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
      osc.start(time);
      osc.stop(time + 0.32);
      time += 0.16;
    });
    setTimeout(() => ctx.close(), 1000);
  } catch {
    // silently ignore if Web Audio not available
  }
}

function buildQuizCards(cards: FlashcardStudyCard[]): QuizCard[] {
  const backs = cards.map((c) => c.back);
  return cards.map((card, i) => {
    const pool = shuffle(backs.filter((_, j) => j !== i));
    // null signals "not enough cards for MC — use free_text instead"
    const d1 = pool[0] ?? null;
    const d2 = pool[1] ?? null;
    return { ...card, distractors: [d1, d2] as unknown as [string, string] };
  });
}

export function FlashcardStudyView({ cards, loading, deckName }: FlashcardStudyViewProps) {
  // ── Build quiz cards instantly from the deck (no API call) ───────────────
  const [quizCards, setQuizCards] = useState<QuizCard[] | null>(null);
  const builtRef = useRef(false);

  useEffect(() => {
    if (!cards || cards.length === 0) return;
    if (builtRef.current) return;
    builtRef.current = true;
    setQuizCards(buildQuizCards(cards));
  }, [cards]);

  // ── Session state ─────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>('learn');
  const [batchIndex, setBatchIndex] = useState(0);

  // learn phase
  const [learnIdx, setLearnIdx] = useState(0);
  const [learnFlipped, setLearnFlipped] = useState(false);
  const [learnSeen, setLearnSeen] = useState(false);

  // quiz phase
  const [quizQueue, setQuizQueue] = useState<QuizQuestion[]>([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [freeText, setFreeText] = useState('');
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [wasCorrect, setWasCorrect] = useState(false);

  // scoring
  const firstAttempt = useRef<Map<string, boolean>>(new Map());
  const missedCards = useRef<QuizCard[]>([]);

  // result
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // ── Space key → flip card during learn phase ─────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code !== 'Space') return;
      if (phase !== 'learn') return;
      // Don't fire when focus is inside a text input / button
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON') return;
      e.preventDefault();
      setLearnFlipped((f) => !f);
      setLearnSeen(true);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase]);

  // Start session once quiz cards are ready
  useEffect(() => {
    if (quizCards) {
      missedCards.current = [];
      firstAttempt.current = new Map();
      setBatchIndex(0);
      startLearnPhase(0, quizCards);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizCards]);

  function startLearnPhase(batch: number, qc: QuizCard[]) {
    const start = batch * BATCH_SIZE;
    if (start >= qc.length) {
      // no more new cards — go to requeue or result
      finishAllBatches();
      return;
    }
    setBatchIndex(batch);
    setLearnIdx(0);
    setLearnFlipped(false);
    setLearnSeen(false);
    setPhase('learn');
  }

  function currentLearnCard(): QuizCard | undefined {
    if (!quizCards) return undefined;
    const start = batchIndex * BATCH_SIZE;
    return quizCards[start + learnIdx];
  }

  function currentBatchCards(): QuizCard[] {
    if (!quizCards) return [];
    const start = batchIndex * BATCH_SIZE;
    return quizCards.slice(start, start + BATCH_SIZE);
  }

  function advanceLearn() {
    const batchCards = currentBatchCards();
    if (learnIdx + 1 < batchCards.length) {
      setLearnIdx((i) => i + 1);
      setLearnFlipped(false);
      setLearnSeen(false);
    } else {
      // start quiz for this batch
      const questions = buildQuizQuestions(batchCards);
      setQuizQueue(questions);
      setQuizIdx(0);
      resetQuizInput();
      setPhase('quiz');
    }
  }

  // ── Quiz helpers ──────────────────────────────────────────────────────────
  function resetQuizInput() {
    setSelectedOption(null);
    setFreeText('');
    setAnswerState('idle');
    setWasCorrect(false);
  }

  function recordResult(cardId: string, correct: boolean) {
    if (!firstAttempt.current.has(cardId)) {
      firstAttempt.current.set(cardId, correct);
    }
  }

  function handleMCSubmit() {
    if (!selectedOption || answerState !== 'idle') return;
    const q = quizQueue[quizIdx];
    const correct = selectedOption === q.card.back;
    setWasCorrect(correct);
    setAnswerState('answered');
    recordResult(q.card._id, correct);
    if (correct) { if (soundEnabled) playSuccessSound(quizIdx >= Math.floor(quizQueue.length / 2)); }
    else { if (soundEnabled) playErrorSound(); missedCards.current.push(q.card); }
  }

  function handleFreeTextSubmit() {
    if (answerState !== 'idle') return;
    setAnswerState('self_mark');
  }

  function handleSelfMark(correct: boolean) {
    const q = quizQueue[quizIdx];
    setWasCorrect(correct);
    setAnswerState('answered');
    recordResult(q.card._id, correct);
    if (correct) { if (soundEnabled) playSuccessSound(quizIdx >= Math.floor(quizQueue.length / 2)); }
    else { if (soundEnabled) playErrorSound(); missedCards.current.push(q.card); }
  }

  function handleSkip() {
    if (answerState !== 'idle') return;
    const q = quizQueue[quizIdx];
    setWasCorrect(false);
    setAnswerState('skipped');
    recordResult(q.card._id, false);
    missedCards.current.push(q.card);
  }

  function advanceQuiz() {
    if (quizIdx + 1 < quizQueue.length) {
      setQuizIdx((i) => i + 1);
      resetQuizInput();
    } else {
      // batch done — next batch or requeue/result
      const nextBatch = batchIndex + 1;
      const start = nextBatch * BATCH_SIZE;
      if (quizCards && start < quizCards.length) {
        startLearnPhase(nextBatch, quizCards);
      } else {
        finishAllBatches();
      }
    }
  }

  function finishAllBatches() {
    const missed = missedCards.current;
    if (missed.length > 0) {
      // one final quiz-only pass for missed cards
      missedCards.current = [];
      const questions = buildQuizQuestions(missed);
      setQuizQueue(questions);
      setQuizIdx(0);
      resetQuizInput();
      setPhase('requeue');
    } else {
      showResult();
    }
  }

  function advanceRequeue() {
    if (quizIdx + 1 < quizQueue.length) {
      setQuizIdx((i) => i + 1);
      resetQuizInput();
    } else {
      showResult();
    }
  }

  function showResult() {
    const total = firstAttempt.current.size;
    let correct = 0;
    firstAttempt.current.forEach((v) => { if (v) correct++; });
    setScore({ correct, total });
    setPhase('result');
  }

  function restartSession() {
    if (!cards?.length) return;
    missedCards.current = [];
    firstAttempt.current = new Map();
    setScore(null);
    setQuizCards(buildQuizCards(cards));
  }

  // ── Progress bar ─────────────────────────────────────────────────────────
  const totalCards = quizCards?.length ?? 0;
  const doneCards = firstAttempt.current.size;
  const progress = totalCards > 0 ? doneCards / totalCards : 0;

  // ── Render helpers ────────────────────────────────────────────────────────
  const outerCls = "w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col min-h-[520px]";

  function renderHeader() {
    return (
      <div className="px-6 pt-6 pb-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex flex-1 justify-center pr-3">
            <div className="w-[90%] h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-pink-400 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>

          {/* Sound toggle */}
          <div className="relative group shrink-0">
            <button
              type="button"
              onClick={() => setSoundEnabled((v) => !v)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                soundEnabled
                  ? 'text-pink-500 bg-pink-50 border-pink-200 hover:bg-pink-100'
                  : 'text-gray-400 bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
              aria-label={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
            >
              {soundEnabled ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5L6 9H2v6h4l5 4V5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />
                </svg>
              )}
            </button>

            {/* Tooltip */}
            <div className="pointer-events-none absolute right-0 top-full mt-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <div className="relative bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                <span className="block font-medium">
                  {soundEnabled ? 'Sound is on' : 'Sound is off'}
                </span>
                <span className="block text-gray-400 mt-0.5">
                  {soundEnabled ? 'Click to mute feedback sounds' : 'Click to enable feedback sounds'}
                </span>
                {/* Arrow */}
                <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 rotate-45" />
              </div>
            </div>
          </div>
        </div>

        {deckName && (
          <p className="text-[11px] text-gray-400 truncate mt-2 text-center" title={deckName}>
            {deckName}
          </p>
        )}
      </div>
    );
  }

  // ── Loading (Convex data not yet ready) ──────────────────────────────────
  if (loading) {
    return (
      <div className={outerCls}>
        {renderHeader()}
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-pink-400 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading cards…</p>
        </div>
      </div>
    );
  }

  // ── No cards ──────────────────────────────────────────────────────────────
  if (!quizCards || quizCards.length === 0) {
    return (
      <div className={outerCls}>
        {renderHeader()}
        <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
          No cards in this deck.
        </div>
      </div>
    );
  }

  // ── Learn phase ───────────────────────────────────────────────────────────
  if (phase === 'learn') {
    const card = currentLearnCard();
    const batchCards = currentBatchCards();
    const batchTotal = batchCards.length;

    if (!card) return null;

    return (
      <div className={outerCls}>
        {renderHeader()}
        <div className="flex-1 flex flex-col px-6 pb-6 pt-2">
          <div className="h-5 flex items-center justify-center mb-3">
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-amber-500">
              NEW CARD
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setLearnFlipped((f) => !f);
              setLearnSeen(true);
            }}
            className="relative mx-auto w-full max-w-sm aspect-4/5 max-h-[280px] cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-gray-300 rounded-2xl"
            style={{ perspective: '1000px' }}
          >
            <div
              className="relative w-full h-full transition-transform duration-500 rounded-2xl border border-gray-200 bg-white shadow-sm group-hover:shadow-md"
              style={{
                transformStyle: 'preserve-3d',
                transform: learnFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              <div
                className="absolute inset-0 flex items-center justify-center p-6 rounded-2xl bg-white"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <p className="text-lg font-semibold text-gray-800 leading-snug text-center">{card.front}</p>
              </div>
              <div
                className="absolute inset-0 flex items-center justify-center p-6 rounded-2xl bg-white"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <p className="text-center text-lg font-medium text-gray-700 leading-snug">{card.back}</p>
              </div>
            </div>
          </button>

          <p className="text-center text-sm text-gray-500 mt-5">
            Click card or press{' '}
            <kbd className="px-2 py-0.5 rounded-md border border-gray-200 bg-gray-50 text-xs font-mono text-gray-600">
              SPACE
            </kbd>{' '}
            to flip
          </p>

          {learnSeen && (
            <div className="mx-auto w-full max-w-sm mt-5">
              <button
                type="button"
                onClick={advanceLearn}
                className="w-full py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 active:bg-pink-700 text-white text-sm font-semibold shadow-sm transition-all duration-150 cursor-pointer"
              >
                {learnIdx + 1 < batchTotal ? 'Next Card →' : 'Start Quiz →'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Quiz / Requeue phase ──────────────────────────────────────────────────
  if (phase === 'quiz' || phase === 'requeue') {
    const q = quizQueue[quizIdx];
    if (!q) return null;
    const isLastInQueue = quizIdx + 1 >= quizQueue.length;
    const advance = phase === 'requeue' ? advanceRequeue : advanceQuiz;

    return (
      <div className={outerCls}>
        {renderHeader()}

        {phase === 'requeue' && (
          <div className="px-6 pt-3 pb-0 flex justify-center">
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-pink-400">
              Review round
            </span>
          </div>
        )}

        <div className="flex-1 flex flex-row gap-0 divide-x divide-gray-100 min-h-0">
          {/* Left — card front (same style as learn phase) */}
          <div className="flex-1 flex flex-col items-center justify-start px-6 py-6">
            <div className="w-full max-w-xs aspect-4/5 max-h-[280px] rounded-2xl border border-gray-200 bg-white shadow-sm flex items-center justify-center p-6">
              <p className="text-center text-lg font-semibold text-gray-800 leading-snug">{q.card.front}</p>
            </div>
          </div>

          {/* Right — answer area */}
          <div className="flex-1 flex flex-col justify-between px-6 py-6 gap-4">
            {answerState === 'idle' && q.type === 'mc' && (
              <>
                <div className="flex flex-col gap-2">
                  {q.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedOption(opt)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer ${
                        selectedOption === opt
                          ? 'border-pink-400 bg-pink-50 text-pink-700 font-medium'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Skip
                  </button>
                  <button
                    type="button"
                    onClick={handleMCSubmit}
                    disabled={!selectedOption}
                    className="flex-1 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Submit
                  </button>
                </div>
              </>
            )}

            {answerState === 'idle' && q.type === 'free_text' && (
              <>
                <textarea
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  placeholder="Type your answer…"
                  rows={4}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Skip
                  </button>
                  <button
                    type="button"
                    onClick={handleFreeTextSubmit}
                    disabled={!freeText.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Submit
                  </button>
                </div>
              </>
            )}

            {answerState === 'self_mark' && (
              <>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Your answer</p>
                  <p className="text-sm text-gray-700">{freeText}</p>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-3 mb-1">Correct answer</p>
                  <p className="text-sm font-medium text-gray-800">{q.card.back}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelfMark(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Missed it
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelfMark(true)}
                    className="flex-1 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Got it
                  </button>
                </div>
              </>
            )}

            {(answerState === 'answered' || answerState === 'skipped') && (
              <>
                <div className={`rounded-xl border px-4 py-3 ${
                  answerState === 'skipped'
                    ? 'border-gray-200 bg-gray-50'
                    : wasCorrect
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-100 bg-red-50'
                }`}>
                  {answerState === 'skipped' ? (
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Correct answer</p>
                  ) : wasCorrect ? (
                    <p className="text-[10px] uppercase tracking-widest text-green-500 mb-1">Correct!</p>
                  ) : (
                    <p className="text-[10px] uppercase tracking-widest text-red-400 mb-1">Incorrect</p>
                  )}
                  <p className="text-sm font-medium text-gray-800">{q.card.back}</p>
                </div>
                <button
                  type="button"
                  onClick={advance}
                  className="w-full py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  {isLastInQueue ? 'Finish' : 'Continue →'}
                </button>
              </>
            )}

            <div className="text-right">
              <span className="text-xs text-gray-400 tabular-nums">{quizIdx + 1} / {quizQueue.length}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Result screen ─────────────────────────────────────────────────────────
  if (phase === 'result' && score) {
    const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    const message =
      pct === 100 ? 'Perfect score! You nailed it.' :
      pct >= 80 ? 'Great work! Almost there.' :
      pct >= 50 ? 'Good effort. Keep practising!' :
      'Keep going — you\'ll get there!';

    return (
      <div className={outerCls}>
        {renderHeader()}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8 py-10">
          <div className="flex flex-col items-center gap-1">
            <span className="text-6xl font-bold text-gray-900 tabular-nums">{pct}%</span>
            <span className="text-sm text-gray-500">{score.correct} / {score.total} correct on first attempt</span>
          </div>

          <div className="w-full max-w-xs h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-pink-400 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>

          <p className="text-sm text-gray-600 text-center">{message}</p>

          <button
            type="button"
            onClick={restartSession}
            className="px-8 py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            Study again
          </button>
        </div>
      </div>
    );
  }

  return null;
}
