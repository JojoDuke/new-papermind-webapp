'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { FlashcardStudyView, type FlashcardStudyCard } from '@/components/app/FlashcardStudyView';

/** Mirrors server cookie so the UI knows the one-time generate limit was used. */
export const LANDING_DEMO_STORAGE_KEY = 'papermind_landing_demo_used';

const LANDING_DEMO_DATA_KEY = 'papermind_landing_demo_data';

type DemoPhase = 'idle' | 'generating' | 'studying';

type SavedDemoPayload = {
  fileName: string;
  cards: { front: string; back: string }[];
};

function toStudyCards(cards: { front: string; back: string }[]): FlashcardStudyCard[] {
  return cards.map((c, i) => ({
    _id: `demo-${i}`,
    front: c.front,
    back: c.back,
    order: i,
    isNew: true,
  }));
}

function loadSavedDemo(): SavedDemoPayload | null {
  try {
    const raw = localStorage.getItem(LANDING_DEMO_DATA_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SavedDemoPayload;
    if (!data.cards?.length) return null;
    return data;
  } catch {
    return null;
  }
}

function clearDemoLocal() {
  try {
    localStorage.removeItem(LANDING_DEMO_STORAGE_KEY);
    localStorage.removeItem(LANDING_DEMO_DATA_KEY);
  } catch {
    // ignore
  }
}

async function resetDemoSession() {
  clearDemoLocal();
  try {
    await fetch('/api/demo/reset', { method: 'POST' });
  } catch {
    // ignore — cookie may still block generate until retry
  }
}

export function DemoWidget() {
  const [phase, setPhase] = useState<DemoPhase>('idle');
  const [cards, setCards] = useState<FlashcardStudyCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [hydrated, setHydrated] = useState(false);
  const [demoLocked, setDemoLocked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const used = localStorage.getItem(LANDING_DEMO_STORAGE_KEY) === '1';
        if (!used) return;

        const saved = loadSavedDemo();
        if (saved) {
          if (cancelled) return;
          setDemoLocked(true);
          setFileName(saved.fileName);
          setCards(toStudyCards(saved.cards));
          setPhase('studying');
          return;
        }

        // Used flag without saved cards — stale state; unlock so they can try again.
        await resetDemoSession();
        if (cancelled) return;
        setDemoLocked(false);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setHydrated(true);
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  function persistDemoSession(name: string, generated: { front: string; back: string }[]) {
    try {
      localStorage.setItem(
        LANDING_DEMO_DATA_KEY,
        JSON.stringify({ fileName: name, cards: generated } satisfies SavedDemoPayload)
      );
      if (!loadSavedDemo()) return;
      localStorage.setItem(LANDING_DEMO_STORAGE_KEY, '1');
    } catch {
      // ignore
    }
  }

  async function handleFile(file: File) {
    if (demoLocked) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File must be under 10 MB.');
      return;
    }
    setError(null);
    setFileName(file.name);
    setPhase('generating');

    const form = new FormData();
    form.append('file', file);

    try {
      const res = await fetch('/api/demo/generate', { method: 'POST', body: form });
      const data = await res.json();

      if (res.status === 403) {
        const saved = loadSavedDemo();
        if (saved) {
          setDemoLocked(true);
          setFileName(saved.fileName);
          setCards(toStudyCards(saved.cards));
          setPhase('studying');
        } else {
          await resetDemoSession();
          setDemoLocked(false);
          setError(
            'Your demo session expired on this device. Upload a PDF below to try again, or sign up for full access.'
          );
          setPhase('idle');
        }
        return;
      }

      if (!res.ok || data.error) throw new Error(data.error ?? 'Generation failed');

      const generated = data.cards as { front: string; back: string }[];
      persistDemoSession(file.name, generated);
      setDemoLocked(true);
      setCards(toStudyCards(generated));
      setPhase('studying');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setPhase('idle');
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (demoLocked) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  if (!hydrated) {
    return (
      <div className="w-full rounded-[20px] bg-white border-[2.5px] border-gray-200 overflow-hidden min-h-[320px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-pink-400 rounded-full animate-spin" />
      </div>
    );
  }

  // ── Studying (first visit or returning to saved demo deck) ─────────────────
  if (phase === 'studying') {
    return (
      <div className="w-full flex flex-col gap-4">
        <div className="flex items-center justify-between px-1 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse shrink-0" />
            <p className="text-xs font-medium text-gray-500 truncate">
              Live demo &mdash;{' '}
              <span className="text-gray-400 font-normal">{fileName}</span>
              {demoLocked && (
                <span className="text-gray-400 font-normal"> &middot; your saved demo deck</span>
              )}
            </p>
          </div>
          {demoLocked ? (
            <Link
              href="/sign-up"
              className="shrink-0 text-xs font-medium text-[#FF5392] hover:text-[#e63f6e] transition-colors"
            >
              Sign up for more
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setPhase('idle');
                setCards([]);
                setFileName(null);
                setError(null);
              }}
              className="shrink-0 text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Back
            </button>
          )}
        </div>
        <FlashcardStudyView cards={cards} loading={false} deckName={fileName ?? undefined} flatChrome />
      </div>
    );
  }

  // ── Generating ────────────────────────────────────────────────────────────
  if (phase === 'generating') {
    return (
      <div className="w-full rounded-[20px] bg-white border-[2.5px] border-gray-200 overflow-hidden">
        <div className="flex flex-col items-center justify-center gap-5 py-20 px-8">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center">
              <svg className="w-7 h-7 text-pink-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="absolute -inset-1 bg-pink-200 rounded-2xl blur-md opacity-30 animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-gray-800 mb-1">Generating your flashcards…</p>
            <p className="text-sm text-gray-400">
              Reading <span className="font-medium text-gray-500">{fileName}</span> and creating your study set
            </p>
          </div>
          <div className="flex gap-1.5 mt-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-pink-300 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Idle / Upload ─────────────────────────────────────────────────────────
  const hasSavedDeck = cards.length > 0;
  const uploadDisabled = demoLocked && hasSavedDeck;
  const staleLocked = demoLocked && !hasSavedDeck;

  return (
    <div className="w-full rounded-[20px] bg-white border-[2.5px] border-gray-200 overflow-hidden">
      <div className="px-8 pt-8 pb-3 border-b border-gray-50">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#FF5392]">Live Demo</span>
          {!uploadDisabled && <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />}
        </div>
        <h3 className="text-xl font-bold font-serif text-gray-900">
          {staleLocked
            ? 'Demo session not found'
            : uploadDisabled
              ? 'Your demo deck is ready'
              : 'Try it with your own PDF'}
        </h3>
        <p className="text-sm text-gray-400 mt-1 font-sans">
          {staleLocked
            ? 'We could not load your saved flashcards on this browser. Try the demo again or create an account.'
            : uploadDisabled
              ? 'Open your saved deck below, or sign up to upload new documents.'
              : 'One try on this page — no sign-up needed.'}
        </p>
      </div>

      <div className="p-8">
        <div
          onDragOver={(e) => {
            if (uploadDisabled) return;
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !uploadDisabled && inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed transition-all duration-200 py-14 px-6 ${
            uploadDisabled
              ? 'border-gray-200 bg-gray-50/80 cursor-not-allowed opacity-60'
              : dragging
                ? 'border-pink-400 bg-pink-50/60 scale-[1.01] cursor-pointer'
                : 'border-gray-200 bg-gray-50/50 hover:border-pink-300 hover:bg-pink-50/30 cursor-pointer'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            disabled={uploadDisabled}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />

          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
              uploadDisabled
                ? 'bg-gray-100 border border-gray-200'
                : dragging
                  ? 'bg-pink-100'
                  : 'bg-white border-[2.5px] border-gray-200'
            }`}
          >
            <svg
              className={`w-7 h-7 transition-colors ${uploadDisabled || !dragging ? 'text-gray-400' : 'text-pink-500'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">
              {uploadDisabled ? 'Upload locked' : dragging ? 'Drop it here' : 'Drag & drop your PDF'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {uploadDisabled ? (
                <>
                  <Link href="/sign-up" className="text-[#FF5392] font-medium hover:underline">
                    Sign up
                  </Link>{' '}
                  to upload your own files
                </>
              ) : (
                <>
                  or <span className="text-[#FF5392] font-medium">click to browse</span> &nbsp;·&nbsp; PDF only &nbsp;·&nbsp; max 10 MB
                </>
              )}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {uploadDisabled && hasSavedDeck && (
          <button
            type="button"
            onClick={() => setPhase('studying')}
            className="mt-4 w-full py-3 rounded-xl bg-pink-50 border border-pink-200 text-sm font-semibold text-[#FF5392] hover:bg-pink-100 transition-colors cursor-pointer"
          >
            Continue studying your demo deck
          </button>
        )}

        {staleLocked && (
          <button
            type="button"
            onClick={async () => {
              await resetDemoSession();
              setDemoLocked(false);
              setCards([]);
              setFileName(null);
              setError(null);
            }}
            className="mt-4 w-full py-3 rounded-xl bg-pink-50 border border-pink-200 text-sm font-semibold text-[#FF5392] hover:bg-pink-100 transition-colors cursor-pointer"
          >
            Try the demo again
          </button>
        )}

        {!uploadDisabled && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { icon: '⚡', label: 'Instant cards', sub: 'Ready in seconds' },
              { icon: '🧠', label: 'Quiz mode', sub: 'Test yourself live' },
              { icon: '🔒', label: 'No sign-up', sub: 'For this demo only' },
            ].map(({ icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-4">
                <span className="text-xl">{icon}</span>
                <p className="text-xs font-semibold text-gray-700 text-center">{label}</p>
                <p className="text-[10px] text-gray-400 text-center">{sub}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
