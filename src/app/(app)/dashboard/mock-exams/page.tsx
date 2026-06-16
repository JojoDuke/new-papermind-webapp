'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { useAuthToken } from '@convex-dev/auth/react';
import { api } from '../../../../../convex/_generated/api';
import { ProtectedRoute } from '@/components/app/ProtectedRoute';
import { DashboardAppShell } from '@/components/app/DashboardAppShell';
import { dashboardMainClass } from '@/components/app/dashboard-page-styles';
import type { Id } from '../../../../../convex/_generated/dataModel';
import toast from 'react-hot-toast';
import { openPricingModal } from '@/components/app/pricing-modal-context';

type Document = {
  _id: Id<'documents'>;
  name: string;
  uploadedAt: number;
  pageCount?: number;
};

function stripPdf(name: string) {
  return name.replace(/\.pdf$/i, '');
}

function formatDate(ms: number) {
  return new Date(ms).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function CreateMockExamModal({
  documents,
  onClose,
}: {
  documents: Document[] | undefined;
  onClose: () => void;
}) {
  const router = useRouter();
  const authToken = useAuthToken();
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [selectedDocId, setSelectedDocId] = useState<Id<'documents'> | null>(null);
  const [title, setTitle] = useState('');
  const [pageFrom, setPageFrom] = useState(1);
  const [pageTo, setPageTo] = useState(10);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(90);
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedDoc = documents?.find((d) => d._id === selectedDocId);

  const handleSelectDoc = (docId: Id<'documents'>) => {
    const doc = documents?.find((d) => d._id === docId);
    setSelectedDocId(docId);
    if (doc) {
      setTitle(`NCLEX-RN Mock Exam — ${stripPdf(doc.name)}`);
      setPageFrom(1);
      setPageTo(doc.pageCount ?? 10);
    }
    setStep('configure');
  };

  const handleGenerate = async () => {
    if (!selectedDocId || !authToken) return;
    if (!title.trim()) { toast.error('Please enter a title.'); return; }
    if (pageFrom < 1 || pageTo < pageFrom) { toast.error('Check page range.'); return; }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/mock-exams/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          documentId: selectedDocId,
          title: title.trim(),
          examType: 'nclex-rn',
          pageRangeStart: pageFrom,
          pageRangeEnd: pageTo,
          timeLimitMinutes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402 || data.error === 'upgrade_required') {
          onClose();
          openPricingModal({
            title: 'Unlock unlimited mock exams',
            subtitle: data.message ?? 'Upgrade to generate more mock exams.',
          });
          return;
        }
        throw new Error(data.error ?? 'Generation failed');
      }
      toast.success('Mock exam created!');
      onClose();
      router.push(`/dashboard/mock-exams/${data.sessionId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create exam');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            {step === 'select' ? 'Select a document' : 'Configure exam'}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          {step === 'select' ? (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {!documents || documents.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">
                  Upload a PDF on the dashboard first.
                </p>
              ) : (
                documents.map((doc) => (
                  <button
                    key={doc._id}
                    type="button"
                    onClick={() => handleSelectDoc(doc._id)}
                    className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#FF5392] hover:bg-pink-50/50 transition-all cursor-pointer"
                  >
                    <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{stripPdf(doc.name)}</p>
                      {doc.pageCount && <p className="text-xs text-gray-400">{doc.pageCount} pages</p>}
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Exam title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Page from</label>
                  <input
                    type="number"
                    min={1}
                    max={selectedDoc?.pageCount ?? 999}
                    value={pageFrom}
                    onChange={(e) => setPageFrom(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Page to</label>
                  <input
                    type="number"
                    min={pageFrom}
                    max={selectedDoc?.pageCount ?? 999}
                    value={pageTo}
                    onChange={(e) => setPageTo(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Time limit</label>
                <select
                  value={timeLimitMinutes}
                  onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 text-gray-900 bg-white cursor-pointer"
                >
                  {[30, 60, 90, 120, 150, 180].map((m) => (
                    <option key={m} value={m}>{m} minutes</option>
                  ))}
                </select>
              </div>

              <p className="text-xs text-gray-400">
                Questions are generated from pages {pageFrom}–{pageTo} of your document using NCLEX-RN style formatting.
              </p>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1 py-2.5 rounded-xl bg-[#FF5392] hover:bg-[#FF5392]/90 text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <span className="inline-flex items-center gap-2 justify-center">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating…
                    </span>
                  ) : (
                    'Generate exam'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MockExamsContent() {
  const router = useRouter();
  const sessions = useQuery(api.mockExams.listMyMockExamSessions, { examType: 'nclex-rn' });
  const documents = useQuery(api.documents.listDocuments);
  const deleteSession = useMutation(api.mockExams.deleteMockExamSession);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleDelete = async (sessionId: Id<'mockExamSessions'>) => {
    try {
      await deleteSession({ sessionId });
      toast.success('Exam deleted.');
    } catch {
      toast.error('Failed to delete exam.');
    }
  };

  return (
    <ProtectedRoute>
      <DashboardAppShell>
        <main className={`${dashboardMainClass} flex flex-col`}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 md:mb-8 shrink-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">🎓</span>
                <h1 className="text-xl font-bold text-gray-900">NCLEX-RN Mock Exams</h1>
              </div>
              <p className="text-sm text-gray-500">
                Full-length timed practice exams built from your nursing study materials
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!documents || documents.length === 0) {
                  toast.error('Upload a document on the dashboard first.');
                  return;
                }
                setShowCreateModal(true);
              }}
              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FF5392] text-white text-sm font-semibold hover:bg-[#FF5392]/90 transition-colors cursor-pointer"
            >
              <span className="text-base leading-none">+</span>
              New Mock Exam
            </button>
          </div>

          {/* Info banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3 shrink-0">
            <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-700 leading-relaxed">
              Questions are generated in NCLEX-RN style from your uploaded notes and textbooks. You won&apos;t see feedback until you submit — just like the real exam.
            </p>
          </div>

          {/* Loading skeleton */}
          {sessions === undefined && (
            <div className="flex flex-wrap gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-full sm:w-72 h-44 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {sessions && sessions.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 min-h-[360px]">
              <div className="w-20 h-20 rounded-2xl bg-purple-100 flex items-center justify-center mb-5">
                <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold font-serif text-gray-900 mb-2">No mock exams yet</h2>
              <p className="text-sm text-gray-500 max-w-sm leading-relaxed mb-6">
                Create your first NCLEX-RN mock exam from any uploaded document. Timed, scored, and built from your own materials.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (!documents || documents.length === 0) {
                    toast.error('Upload a document on the dashboard first.');
                    return;
                  }
                  setShowCreateModal(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF5392] text-white text-sm font-semibold hover:bg-[#FF5392]/90 transition-colors cursor-pointer"
              >
                <span className="text-base leading-none">+</span>
                Create your first exam
              </button>
            </div>
          )}

          {/* Sessions list */}
          {sessions && sessions.length > 0 && (
            <div className="flex flex-wrap gap-5">
              {sessions.map((session) => {
                const isComplete = !!session.completedAt;
                const isInProgress = !!session.startedAt && !session.completedAt;
                const scoreColor =
                  session.scorePercent !== undefined
                    ? session.scorePercent >= 75
                      ? 'text-emerald-600'
                      : session.scorePercent >= 50
                      ? 'text-amber-600'
                      : 'text-red-500'
                    : '';

                return (
                  <div
                    key={session._id}
                    className="w-full sm:w-72 bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(session._id)}
                        className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer"
                        aria-label="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 leading-snug mb-1 line-clamp-2">{session.title}</p>
                      <p className="text-xs text-gray-400">{session.questions.length} questions · {session.timeLimitMinutes} min</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(session.createdAt)}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        isComplete
                          ? 'bg-emerald-100 text-emerald-700'
                          : isInProgress
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isComplete ? 'Completed' : isInProgress ? 'In progress' : 'Not started'}
                      </span>
                      {isComplete && session.scorePercent !== undefined && (
                        <span className={`text-sm font-bold ${scoreColor}`}>{session.scorePercent}%</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => router.push(`/dashboard/mock-exams/${session._id}`)}
                      className="w-full py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-[#FF5392] hover:text-[#FF5392] hover:bg-pink-50 transition-all cursor-pointer"
                    >
                      {isComplete ? 'Review results' : isInProgress ? 'Continue exam' : 'Start exam'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {showCreateModal && (
          <CreateMockExamModal
            documents={documents}
            onClose={() => setShowCreateModal(false)}
          />
        )}
      </DashboardAppShell>
    </ProtectedRoute>
  );
}

export default function MockExamsPage() {
  return (
    <Suspense fallback={null}>
      <MockExamsContent />
    </Suspense>
  );
}
