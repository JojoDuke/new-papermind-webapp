'use client';

import type { MockExamCatalogItem, MockExamCategory } from '@/lib/mock-exam-catalog';

type MockExamCatalogCardProps = {
  exam: MockExamCatalogItem;
  category: MockExamCategory;
  onClick: () => void;
};

export function MockExamCatalogCard({ exam, category, onClick }: MockExamCatalogCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col text-left bg-surface-card border border-border-default rounded-2xl p-5 hover:border-[#FF5392]/40 hover:shadow-md dark:hover:shadow-black/20 transition-all cursor-pointer h-full min-h-[168px]"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${category.accentBg}`}
        >
          <svg
            className={`w-5 h-5 ${category.accent}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={category.iconPath} />
          </svg>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-subtle text-text-muted shrink-0">
          {category.label}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary leading-snug mb-1.5 line-clamp-2 group-hover:text-[#FF5392] transition-colors">
          {exam.title}
        </p>
        <p className="text-xs text-text-faint leading-relaxed line-clamp-2">{exam.description}</p>
      </div>

      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border-subtle text-xs text-text-faint">
        <span>{exam.questionCount} questions</span>
        <span className="text-border-default">·</span>
        <span>{exam.timeLimitMinutes} min</span>
      </div>
    </button>
  );
}
