'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '../../../../../../../convex/_generated/api';
import { StudyGuideDetailView } from '@/components/app/StudyGuideDetailView';
import { StudyGuideChatPanel, StudyGuideChatToggle } from '@/components/app/StudyGuideChatPanel';
import Link from 'next/link';
import type { Id } from '../../../../../../../convex/_generated/dataModel';

export default function StudyGuideDetailPage() {
  const params = useParams();
  const guideId = params?.guideId as Id<'studyGuides'>;
  const guide = useQuery(api.studyGuides.getStudyGuide, { guideId });
  const [chatOpen, setChatOpen] = useState(false);

  const loading = guide === undefined;
  const notFound = guide === null;

  return (
    <div className="flex flex-1 min-w-0 min-h-0 overflow-hidden relative">
          <main
            className={`flex-1 overflow-y-auto bg-surface-page p-4 sm:p-6 md:p-8 min-w-0 transition-[margin] duration-300 ${
              chatOpen ? 'mr-0 sm:mr-[min(400px,100vw)]' : ''
            }`}
          >
            {loading && (
              <div className="max-w-3xl animate-pulse space-y-4">
                <div className="h-4 bg-surface-subtle rounded w-16" />
                <div className="h-8 bg-surface-subtle rounded w-2/3" />
                <div className="h-4 bg-surface-subtle rounded w-full max-w-md" />
                <div className="h-32 bg-green-50 rounded-2xl mt-8" />
              </div>
            )}

            {notFound && (
              <div className="max-w-sm py-16">
                <p className="text-sm text-text-secondary mb-4">This study guide could not be found.</p>
                <Link
                  href="/dashboard/study-guides"
                  className="text-sm font-medium text-green-600 hover:text-green-700"
                >
                  Back to study guides
                </Link>
              </div>
            )}

            {guide && (
              <StudyGuideDetailView
                title={guide.title}
                documentName={guide.documentName}
                content={guide.content}
              />
            )}
          </main>

          {guide && !chatOpen && (
            <StudyGuideChatToggle onClick={() => setChatOpen(true)} />
          )}

          {guide && (
            <StudyGuideChatPanel
              key={guide._id}
              guideId={guide._id}
              guideTitle={guide.title}
              isOpen={chatOpen}
              onClose={() => setChatOpen(false)}
            />
          )}

          {chatOpen && (
            <button
              type="button"
              className="fixed inset-0 z-30 bg-black/20 sm:hidden"
              aria-label="Close chat"
              onClick={() => setChatOpen(false)}
            />
          )}
        </div>
  );
}
