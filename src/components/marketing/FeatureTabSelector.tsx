'use client';

import { useState } from 'react';

const TABS = ['Flashcards', 'Quizzes', 'Mock Exams'] as const;

const FEATURE_DETAILS = [
  {
    eyebrow: 'Flashcards',
    title: 'Turn your PDF into study-ready cards',
    description:
      'Upload lecture slides, textbooks, or revision notes — Papermind reads your material and builds clear question–answer and term–definition cards. Flip, peek, and track what you still need to learn.',
    bullets: [
      'Instant generation from your PDF',
      'Question–answer and term–definition pairs',
      'Fits into your quiz and review flow',
    ],
  },
  {
    eyebrow: 'Quizzes',
    title: 'Test yourself the smart way',
    description:
      'Adaptive quizzes that track what you get wrong and automatically bring those topics back — so every study session compounds and weak areas get the reps they need.',
    bullets: [
      'Multiple choice and free response',
      'Prioritises topics you miss',
      'Built from your uploaded material',
    ],
  },
  {
    eyebrow: 'Mock exams',
    title: 'Simulate the real thing',
    description:
      'Full timed mock exams built directly from your material — formatted like the actual test so there are no surprises on exam day.',
    bullets: ['Timed, exam-style pacing', 'Sourced from your documents', 'Know where you stand before the real day'],
  },
] as const;

/** Landing-page feature tabs + detail panel. Uses 2.5px grey border, no shadow. */
export function FeatureTabSelector() {
  const [selected, setSelected] = useState(0);
  const detail = FEATURE_DETAILS[selected];

  return (
    <div className="mt-8 w-full max-w-3xl mx-auto">
      <div className="flex w-full max-w-full justify-center overflow-x-auto px-1">
        <div
          className="inline-flex shrink-0 overflow-hidden rounded-[10px] border-[2.5px] border-gray-200 bg-white"
          role="tablist"
          aria-label="Feature highlights"
        >
          {TABS.map((label, i) => {
            const isActive = selected === i;
            return (
              <button
                key={label}
                type="button"
                role="tab"
                id={`feature-tab-${i}`}
                aria-controls="feature-tabpanel"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setSelected(i)}
                className={`relative flex min-w-0 items-center justify-center px-5 py-2.5 text-sm font-medium font-sans whitespace-nowrap transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 ${
                  i !== 0 ? 'border-l-[2.5px] border-gray-200' : ''
                } ${
                  isActive
                    ? 'pink-glowing-button flat-chrome text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        id="feature-tabpanel"
        role="tabpanel"
        aria-labelledby={`feature-tab-${selected}`}
        className="mt-6 rounded-[20px] border-[2.5px] border-gray-200 bg-white p-8 md:p-10 text-left"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">{detail.eyebrow}</p>
        <h3 className="text-2xl font-bold font-serif text-gray-900 mb-3">{detail.title}</h3>
        <p className="text-gray-500 font-sans leading-relaxed mb-6">{detail.description}</p>
        <ul className="space-y-2.5">
          {detail.bullets.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm text-gray-600 font-sans leading-relaxed">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF5392]" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
