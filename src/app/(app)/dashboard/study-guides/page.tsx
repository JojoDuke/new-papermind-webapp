'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { ProtectedRoute } from '@/components/app/ProtectedRoute';
import { DashboardSidebar } from '@/components/app/DashboardSidebar';
import { StudyGuideContent } from '@/components/app/StudyGuideContent';
import toast from 'react-hot-toast';
import type { Id } from '../../../../../convex/_generated/dataModel';

export default function StudyGuidesPage() {
  const studyGuides = useQuery(api.studyGuides.listMyStudyGuides);
  const deleteStudyGuide = useMutation(api.studyGuides.deleteStudyGuide);
  const [expandedGuideId, setExpandedGuideId] = useState<Id<'studyGuides'> | null>(null);

  const handleDelete = async (guideId: Id<'studyGuides'>) => {
    try {
      await deleteStudyGuide({ guideId });
      toast.success('Study guide deleted.');
      if (expandedGuideId === guideId) setExpandedGuideId(null);
    } catch {
      toast.error('Failed to delete. Please try again.');
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Study Guides</h1>
          <p className="text-sm text-gray-500 mb-8">
            Comprehensive summaries and explanations to help you understand key topics in depth
          </p>

          {studyGuides === undefined && (
            <div className="flex flex-col gap-3 max-w-3xl">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[72px] rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          )}

          {studyGuides && studyGuides.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-2 max-w-md">
              <svg className="w-10 h-10 text-gray-200 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-sm font-medium text-gray-600">No study guides yet</p>
              <p className="text-xs text-gray-400">
                Upload a document on the dashboard and we&apos;ll generate study guides for you automatically.
              </p>
            </div>
          )}

          {studyGuides && studyGuides.length > 0 && (
            <div className="flex flex-col gap-3 max-w-3xl">
              {studyGuides.map((guide) => (
                <div key={guide._id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                  <button
                    onClick={() => setExpandedGuideId(expandedGuideId === guide._id ? null : guide._id)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{guide.title}</p>
                      <p className="text-xs text-gray-400 truncate">From: {guide.documentName}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-gray-400 hidden sm:block">
                        {new Date(guide.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${expandedGuideId === guide._id ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {expandedGuideId === guide._id && (
                    <div className="border-t border-gray-100 px-5 py-5">
                      <StudyGuideContent content={guide.content} />
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => handleDelete(guide._id)}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
