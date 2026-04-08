'use client';

import { useState } from 'react';

const TABS = ['Flashcards', 'Quizzes', 'Mock Exams'] as const;

export function FeatureTabSelector() {
  const [selected, setSelected] = useState(0);

  return (
    <div className="mt-8 flex w-full max-w-full justify-center overflow-x-auto px-1">
      <div
        className="inline-flex shrink-0 overflow-hidden rounded-[10px] border border-gray-200 bg-white shadow-sm"
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
              aria-selected={isActive}
              tabIndex={0}
              onClick={() => setSelected(i)}
              className={`relative flex min-w-0 items-center justify-center px-5 py-2.5 text-sm font-medium font-sans whitespace-nowrap transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 ${
                i !== 0 ? 'border-l border-gray-200' : ''
              } ${
                isActive
                  ? 'pink-glowing-button text-white shadow-none'
                  : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              {isActive && (
                <span className="absolute inset-0 z-20 pointer-events-none" aria-hidden="true">
                  <span className="blurred-border absolute inset-0 z-20" />
                </span>
              )}
              <span className={isActive ? 'relative z-30' : undefined}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
