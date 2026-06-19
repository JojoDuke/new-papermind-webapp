'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { parseStudyGuideSections, type StudyGuideTab } from '@/lib/parseStudyGuideSections';
import { StudyGuideSectionBody } from '@/components/app/StudyGuideSectionBody';

const TABS: { id: StudyGuideTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'keyConcepts', label: 'Key Concepts' },
  { id: 'examples', label: 'Examples' },
  { id: 'summary', label: 'Summary' },
];

type StudyGuideDetailViewProps = {
  title: string;
  documentName: string;
  content: string;
  backHref?: string;
};

export function StudyGuideDetailView({
  title,
  documentName,
  content,
  backHref = '/dashboard/study-guides',
}: StudyGuideDetailViewProps) {
  const [activeTab, setActiveTab] = useState<StudyGuideTab>('overview');
  const parsed = parseStudyGuideSections(content);

  const tabContent: Record<StudyGuideTab, string> = {
    overview: parsed.overview,
    keyConcepts: parsed.keyConcepts,
    examples: parsed.examples,
    summary: parsed.summary,
  };

  return (
    <div className="max-w-3xl w-full pb-12">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      <p className="text-xs text-text-faint font-sans mb-1">Study Guide</p>
      <h1 className="text-2xl md:text-3xl font-bold font-serif text-text-primary mb-6 leading-tight">
        {title}
      </h1>

      <nav
        className="flex flex-wrap gap-x-6 gap-y-1 border-b border-border-default mb-8"
        aria-label="Study guide sections"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer border-b-2 -mb-px ${
                isActive
                  ? 'text-green-600 dark:text-green-400 border-green-400'
                  : 'text-text-faint border-transparent hover:text-text-secondary'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {activeTab === 'overview' ? (
        <OverviewTab
          overview={parsed.overview}
          keyFormula={parsed.keyFormula}
          keyTakeaways={parsed.keyTakeaways}
        />
      ) : (
        <TabPanel
          label={TABS.find((t) => t.id === activeTab)?.label ?? ''}
          body={tabContent[activeTab]}
          emptyMessage={`No ${TABS.find((t) => t.id === activeTab)?.label?.toLowerCase()} content for this guide yet.`}
        />
      )}

      <p className="text-[11px] text-text-faint mt-10 font-sans">From: {documentName}</p>
    </div>
  );
}

function OverviewTab({
  overview,
  keyFormula,
  keyTakeaways,
}: {
  overview: string;
  keyFormula: { formula: string; legend: string } | null;
  keyTakeaways: string[];
}) {
  return (
    <div className="flex flex-col gap-6">
      {overview && (
        <div className="rounded-2xl bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/40 px-6 py-5">
          <h2 className="text-base font-bold font-serif text-text-primary mb-2">Overview</h2>
          <StudyGuideSectionBody content={overview} compact />
        </div>
      )}

      {keyFormula && (
        <div className="rounded-2xl border border-border-default bg-surface-card overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-stretch">
            <div className="flex-1 min-w-0 px-6 py-5">
              <h2 className="text-base font-bold font-serif text-text-primary mb-3">Key Formula</h2>
              <p className="text-lg font-serif text-text-primary tracking-wide mb-4">
                {keyFormula.formula}
              </p>
              {keyFormula.legend && (
                <div>
                  <p className="text-sm font-semibold text-text-primary mb-2">Where:</p>
                  <StudyGuideSectionBody content={keyFormula.legend} compact />
                </div>
              )}
            </div>
            <div className="hidden sm:block relative w-[240px] shrink-0 overflow-hidden">
              <Image
                src="/assets/foxLeftSidebar.png"
                alt=""
                width={240}
                height={240}
                className="absolute bottom-0 right-0 w-[240px] h-auto max-w-none object-contain object-bottom mix-blend-multiply dark:mix-blend-normal -scale-x-100 translate-y-10"
              />
            </div>
          </div>
        </div>
      )}

      {keyTakeaways.length > 0 && (
        <div className="rounded-2xl border border-border-default bg-surface-card px-6 py-5">
          <h2 className="text-base font-bold font-serif text-text-primary mb-4">Key Takeaways</h2>
          <ul className="flex flex-col gap-3">
            {keyTakeaways.map((item, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-text-secondary leading-relaxed">
                <span className="text-green-500 shrink-0 mt-0.5" aria-hidden>
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!overview && !keyFormula && keyTakeaways.length === 0 && (
        <p className="text-sm text-text-muted">No overview content for this guide yet.</p>
      )}
    </div>
  );
}

function TabPanel({
  label,
  body,
  emptyMessage,
}: {
  label: string;
  body: string;
  emptyMessage: string;
}) {
  if (!body.trim()) {
    return <p className="text-sm text-text-muted">{emptyMessage}</p>;
  }

  return (
    <div className="rounded-2xl border border-border-default bg-surface-card px-6 py-5">
      <h2 className="text-base font-bold font-serif text-text-primary mb-4">{label}</h2>
      <StudyGuideSectionBody content={body} />
    </div>
  );
}
