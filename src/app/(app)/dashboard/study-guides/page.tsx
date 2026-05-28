'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { ProtectedRoute } from '@/components/app/ProtectedRoute';
import { DashboardAppShell } from '@/components/app/DashboardAppShell';
import toast from 'react-hot-toast';
import type { Id } from '../../../../../convex/_generated/dataModel';

export default function StudyGuidesPage() {
  const router = useRouter();
  const studyGuides = useQuery(api.studyGuides.listMyStudyGuides);
  const deleteStudyGuide = useMutation(api.studyGuides.deleteStudyGuide);
  const [openMenuId, setOpenMenuId] = useState<Id<'studyGuides'> | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  const handleDelete = async (guideId: Id<'studyGuides'>) => {
    try {
      await deleteStudyGuide({ guideId });
      toast.success('Study guide deleted.');
      if (openMenuId === guideId) setOpenMenuId(null);
    } catch {
      toast.error('Failed to delete. Please try again.');
    }
  };

  return (
    <ProtectedRoute>
      <DashboardAppShell>
        <main className="flex-1 overflow-y-auto bg-white p-8 flex flex-col min-h-0">
          <div className="flex items-start justify-between gap-4 shrink-0">
            <div>
              <h1 className="text-2xl font-bold font-serif text-gray-900 mb-2">Study Guides</h1>
              <p className="text-sm text-gray-500 font-sans max-w-xl">
                Comprehensive summaries and explanations to help you understand key topics in depth.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#FF5392] text-[#FF5392] text-sm font-semibold font-sans hover:bg-pink-50 transition-colors"
            >
              <span className="text-base leading-none">+</span>
              Create from document
            </Link>
          </div>

          {studyGuides === undefined && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col items-center gap-3 animate-pulse"
                >
                  <div className="w-14 h-16 bg-gray-100 rounded" />
                  <div className="w-full space-y-2">
                    <div className="h-2.5 bg-gray-100 rounded-full w-3/4 mx-auto" />
                    <div className="h-2 bg-gray-50 rounded-full w-1/2 mx-auto" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {studyGuides && studyGuides.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12 min-h-[420px]">
              <Image
                src="/assets/foxAsleepEmptyState.png"
                alt="Sleeping fox — no study guides yet"
                width={360}
                height={360}
                priority
                className="object-contain w-full max-w-[320px] h-auto mb-6"
              />
              <h2 className="text-2xl md:text-3xl font-bold font-serif text-gray-900 mb-3">
                No study guides yet
              </h2>
              <p className="text-sm text-gray-500 font-sans max-w-md leading-relaxed">
                We haven&apos;t created any study guides for your documents yet. Upload a document
                and our AI will create comprehensive study guides to help you learn better.
              </p>
            </div>
          )}

          {studyGuides && studyGuides.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
              {studyGuides.map((guide) => (
                <div
                  key={guide._id}
                  className="group relative bg-white border border-gray-200 hover:border-green-200 rounded-xl p-5 flex flex-col items-center gap-3 transition-colors"
                >
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === guide._id ? null : guide._id);
                      }}
                      className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
                      aria-label="Study guide options"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="12" cy="19" r="1.5" />
                      </svg>
                    </button>
                    {openMenuId === guide._id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-7 z-20 bg-white border border-gray-100 rounded-lg shadow-lg py-1 w-36"
                      >
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            handleDelete(guide._id);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push(`/dashboard/study-guides/${guide._id}`)}
                    className="flex flex-col items-center gap-3 w-full cursor-pointer pt-2 text-left"
                  >
                    <div className="relative w-14 h-16">
                      <svg className="w-14 h-16 text-green-200" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                        <path d="M14 2v6h6" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 text-[7px] font-bold text-white tracking-wide">
                        Guide
                      </span>
                    </div>
                    <div className="w-full text-center">
                      <p className="text-xs font-medium text-gray-700 truncate w-full" title={guide.title}>
                        {guide.title}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(guide.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}

        </main>
      </DashboardAppShell>
    </ProtectedRoute>
  );
}
