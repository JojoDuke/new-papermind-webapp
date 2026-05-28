'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { ProtectedRoute } from '@/components/app/ProtectedRoute';
import { DashboardAppShell } from '@/components/app/DashboardAppShell';
import { StudyGuideDetailView } from '@/components/app/StudyGuideDetailView';
import { StudyGuideChatPanel, StudyGuideChatToggle } from '@/components/app/StudyGuideChatPanel';
import Link from 'next/link';
import type { Id } from '../../../../../../convex/_generated/dataModel';

export default function StudyGuideDetailPage() {
  const params = useParams();
  const guideId = params?.guideId as Id<'studyGuides'>;
  const guide = useQuery(api.studyGuides.getStudyGuide, { guideId });
  const [chatOpen, setChatOpen] = useState(false);

  const loading = guide === undefined;
  const notFound = guide === null;

  return (
    <ProtectedRoute>
      <DashboardAppShell>
        <div className="flex flex-1 min-w-0 relative">
          <main
            className={`flex-1 overflow-y-auto bg-gray-50 p-8 transition-[margin] duration-300 ${
              chatOpen ? 'mr-0 sm:mr-[400px]' : ''
            }`}
          >
            {loading && (
              <div className="max-w-3xl animate-pulse space-y-4">
                <div className="h-4 bg-gray-100 rounded w-16" />
                <div className="h-8 bg-gray-100 rounded w-2/3" />
                <div className="h-4 bg-gray-100 rounded w-full max-w-md" />
                <div className="h-32 bg-green-50 rounded-2xl mt-8" />
              </div>
            )}

            {notFound && (
              <div className="max-w-sm py-16">
                <p className="text-sm text-gray-600 mb-4">This study guide could not be found.</p>
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
      </DashboardAppShell>
    </ProtectedRoute>
  );
}
