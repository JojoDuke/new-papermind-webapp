'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as Id<'documents'>;
  const doc = useQuery(api.documents.getDocument, { documentId });

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 shrink-0">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="h-4 w-px bg-gray-200" />
          <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
            {doc === undefined ? (
              <span className="inline-block w-40 h-3.5 bg-gray-100 rounded animate-pulse" />
            ) : (
              doc?.name ?? 'Document not found'
            )}
          </p>
        </header>

        {/* Main split layout */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left — PDF viewer */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-200">
            {doc === undefined ? (
              /* Loading skeleton */
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-pink-300 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-400">Loading document…</p>
                </div>
              </div>
            ) : doc?.url ? (
              <iframe
                src={doc.url}
                className="flex-1 w-full h-full"
                title={doc.name}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-gray-400">Could not load document.</p>
              </div>
            )}
          </div>

          {/* Right — Actions panel */}
          <div className="w-72 shrink-0 bg-white flex flex-col p-6 gap-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-1">Study Tools</h2>
              <p className="text-xs text-gray-400">Generate study materials from this document.</p>
            </div>

            {/* Generate Flashcards */}
            <button
              disabled={!doc}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="w-8 h-8 bg-pink-200 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-pink-300 transition-colors">
                <svg className="w-4 h-4 text-pink-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-pink-800">Generate Flashcards</p>
                <p className="text-[11px] text-pink-500 mt-0.5">Turn key concepts into cards</p>
              </div>
            </button>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
