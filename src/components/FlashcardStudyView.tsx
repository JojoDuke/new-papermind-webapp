'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export type FlashcardStudyCard = {
  _id: string;
  front: string;
  back: string;
  order: number;
  isNew: boolean;
};

type FlashcardStudyViewProps = {
  cards: FlashcardStudyCard[] | undefined;
  loading: boolean;
  documentName?: string;
};

export function FlashcardStudyView({
  cards,
  loading,
  documentName,
}: FlashcardStudyViewProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [peek, setPeek] = useState(false);

  const total = cards?.length ?? 0;
  const card = total > 0 && cards ? cards[index] : undefined;

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
    setPeek(false);
  }, [cards]);

  const goNext = useCallback(() => {
    if (!cards?.length) return;
    setIndex((i) => Math.min(cards.length - 1, i + 1));
    setFlipped(false);
    setPeek(false);
  }, [cards]);

  const goPrev = useCallback(() => {
    if (!cards?.length) return;
    setIndex((i) => Math.max(0, i - 1));
    setFlipped(false);
    setPeek(false);
  }, [cards]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setFlipped((f) => !f);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  const progress = total > 0 ? (index + 1) / total : 0;

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col min-h-[420px]">
      <div className="px-6 pt-8 pb-2">
        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gray-300 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        {documentName && (
          <p className="text-[11px] text-gray-400 truncate mt-2 text-center" title={documentName}>
            {documentName}
          </p>
        )}
      </div>

      <div className="flex-1 flex flex-col px-6 pb-6 pt-2">
        {loading || !cards ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading cards…</p>
          </div>
        ) : total === 0 ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
            No cards in this deck.
          </div>
        ) : !card ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
            Card not available.
          </div>
        ) : (
          <>
            <div className="h-5 flex items-center justify-center mb-3">
              {card.isNew ? (
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-amber-500">
                  NEW CARD
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className="relative mx-auto w-full max-w-sm aspect-4/5 max-h-[280px] cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-gray-300 rounded-2xl"
              style={{ perspective: '1000px' }}
            >
              <div
                className="relative w-full h-full transition-transform duration-500 rounded-2xl border border-gray-200 bg-white shadow-sm group-hover:shadow-md"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                <div
                  className="absolute inset-0 flex items-center justify-center p-6 rounded-2xl bg-white"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-800 leading-snug">{card.front}</p>
                    {peek && !flipped && (
                      <p className="mt-4 text-xs text-gray-400 leading-relaxed border-t border-dashed border-gray-200 pt-3">
                        {card.back}
                      </p>
                    )}
                  </div>
                </div>
                <div
                  className="absolute inset-0 flex items-center justify-center p-6 rounded-2xl bg-white"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <p className="text-center text-lg font-medium text-gray-700 leading-snug">
                    {card.back}
                  </p>
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

            <p className="text-center text-[11px] text-gray-400 mt-1">
              <kbd className="px-1.5 py-0.5 rounded border border-gray-100 bg-gray-50 font-mono text-[10px]">←</kbd>{' '}
              <kbd className="px-1.5 py-0.5 rounded border border-gray-100 bg-gray-50 font-mono text-[10px]">→</kbd>{' '}
              previous / next ·{' '}
              <kbd className="px-1.5 py-0.5 rounded border border-gray-100 bg-gray-50 font-mono text-[10px]">Esc</kbd>{' '}
              exit
            </p>

            <div className="mt-auto flex items-center justify-between pt-6">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPeek((p) => !p)}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    peek ? 'bg-gray-100 text-gray-700' : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50'
                  }`}
                  aria-label={peek ? 'Hide peek' : 'Peek at answer'}
                  title="Peek at answer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => toast('Card details and reporting will be available soon.')}
                  className="p-2 rounded-xl text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                  aria-label="Card info"
                  title="Info"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </div>
              <span className="text-xs text-gray-400 tabular-nums">
                {index + 1} / {total}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
