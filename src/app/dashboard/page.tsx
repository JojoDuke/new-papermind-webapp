'use client';

import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import toast from 'react-hot-toast';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { useAuthToken } from '@convex-dev/auth/react';

export default function DashboardPage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<Id<'documents'> | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<Id<'documents'> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<Id<'documents'> | null>(null);
  const [cardCount, setCardCount] = useState<'low' | 'medium' | 'high'>('low');
  const [cardTypes, setCardTypes] = useState({ termDef: true, qa: true });
  const [pageRangeFrom, setPageRangeFrom] = useState(1);
  const [pageRangeTo, setPageRangeTo] = useState(10);
  const [isGeneratingDeck, setIsGeneratingDeck] = useState(false);
  const [deckName, setDeckName] = useState('');
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const cardCountMap = { low: '10–15', medium: '20–30', high: '40–50' };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = useQuery(api.auth.currentUser);
  const documents = useQuery(api.documents.listDocuments);
  const selectedDoc = useQuery(
    api.documents.getDocument,
    selectedDocId ? { documentId: selectedDocId } : 'skip'
  );
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const saveDocument = useMutation(api.documents.saveDocument);
  const deleteDocument = useMutation(api.documents.deleteDocument);
  const generateStubDeck = useMutation(api.flashcards.generateStubDeck);
  const authToken = useAuthToken();

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setIsDeleting(true);
    try {
      await deleteDocument({ documentId: confirmDeleteId });
      if (selectedDocId === confirmDeleteId) setSelectedDocId(null);
      toast.success('Document deleted.');
    } catch {
      toast.error('Failed to delete. Please try again.');
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsUploading(true);
    setUploadingFileName(file.name);

    try {
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) throw new Error("Upload failed");

      const { storageId } = await response.json();
      const documentId = await saveDocument({ storageId, name: file.name });
      toast.success(`"${file.name}" uploaded successfully!`);

      // Fire-and-forget: count pages in the background and store on the document
      if (authToken) {
        fetch('/api/documents/count-pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ documentId }),
        }).catch(() => {/* non-critical, fail silently */});
      }
    } catch (err) {
      toast.error("Upload failed. Please try again.");
      console.error(err);
    } finally {
      setIsUploading(false);
      setUploadingFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleGenerateFlashcards = async () => {
    if (!selectedDocId || selectedDoc === undefined || selectedDoc === null) return;
    if (!deckName.trim()) {
      toast.error('Please give your deck a name.');
      return;
    }
    if (!cardTypes.termDef && !cardTypes.qa) {
      toast.error('Select at least one flashcard type.');
      return;
    }
    if (pageRangeFrom < 1 || pageRangeTo < 1) {
      toast.error('Page numbers must be at least 1.');
      return;
    }
    if (pageRangeFrom > pageRangeTo) {
      toast.error('The first page must come before the last page.');
      return;
    }
    setIsGeneratingDeck(true);
    try {
      if (authToken) {
        // Use AI generation via the backend API
        const res = await fetch('/api/flashcards/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            documentId: selectedDocId,
            deckName: deckName.trim(),
            pageRangeStart: pageRangeFrom,
            pageRangeEnd: pageRangeTo,
            cardCountPreset: cardCount,
            includeTermDef: cardTypes.termDef,
            includeQa: cardTypes.qa,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(err.error ?? 'Generation failed');
        }
        const { deckId } = await res.json();
        router.push(`/dashboard/flashcards/${deckId}`);
        toast.success('Flashcards generated.');
      } else {
        // Fallback: stub deck (no auth token yet)
        const { deckId } = await generateStubDeck({
          documentId: selectedDocId,
          deckName: deckName.trim(),
          pageRangeStart: pageRangeFrom,
          pageRangeEnd: pageRangeTo,
          cardCount,
          includeTermDef: cardTypes.termDef,
          includeQa: cardTypes.qa,
        });
        router.push(`/dashboard/flashcards/${deckId}`);
        toast.success('Flashcards generated.');
      }
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : 'Could not generate flashcards. Try again.');
    } finally {
      setIsGeneratingDeck(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <DashboardSidebar />

        {selectedDocId ? (
          /* ── Generation config view ── */
          <main className="flex-1 overflow-y-auto p-8">
            <button
              onClick={() => { setSelectedDocId(null); setDeckName(''); }}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors cursor-pointer mb-6"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <div className="max-w-md mx-auto flex flex-col gap-4">

              {/* Document name + generate button */}
              <div className="bg-pink-50 border border-pink-100 rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-pink-200 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-pink-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                      <path d="M14 2v6h6" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-800 truncate">
                    {selectedDoc === undefined
                      ? <span className="inline-block w-40 h-3 bg-pink-200 rounded animate-pulse" />
                      : selectedDoc?.name}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">
                    Deck Name
                  </label>
                  <input
                    type="text"
                    placeholder="What would you like to name this deck?"
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                    maxLength={80}
                    className="w-full px-3 py-2.5 rounded-lg border border-pink-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleGenerateFlashcards}
                  disabled={
                    !selectedDoc || selectedDoc === undefined || isGeneratingDeck || !deckName.trim()
                  }
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold text-sm tracking-wide transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  {isGeneratingDeck && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                  )}
                  {isGeneratingDeck ? 'Generating…' : 'generate flashcards'}
                </button>
              </div>

              {/* Options card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-5">

                {/* Page range */}
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">Page Range</p>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex flex-col gap-1">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wide">From</span>
                      <input
                        type="number"
                        min={1}
                        value={pageRangeFrom}
                        onChange={(e) => setPageRangeFrom(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
                      />
                    </label>
                    <span className="text-gray-300 pt-5">—</span>
                    <label className="flex-1 flex flex-col gap-1">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wide">To</span>
                      <input
                        type="number"
                        min={1}
                        value={pageRangeTo}
                        onChange={(e) => setPageRangeTo(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2">
                    {selectedDoc?.pageCount
                      ? `This document has ${selectedDoc.pageCount} page${selectedDoc.pageCount === 1 ? '' : 's'}.`
                      : 'Flashcards will be generated from the selected pages.'}
                  </p>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Number of flashcards */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">Number of Flashcards</span>
                    <span className="text-xs text-gray-400">estimated {cardCountMap[cardCount]}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as const).map((level) => {
                      const isLow = level === 'low';
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => isLow ? setCardCount(level) : setShowUpgradePopup(true)}
                          className={`py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                            !isLow
                              ? 'bg-gray-50 text-gray-400 border-gray-100 hover:border-pink-200 hover:text-pink-400'
                              : cardCount === level
                                ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-pink-300 hover:text-pink-600'
                          }`}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100" />

                {/* Flashcard types */}
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-3">Flashcard Types</p>
                  <div className="flex flex-col gap-2.5">
                    {[
                      { key: 'termDef', label: 'term & definition' },
                      { key: 'qa',      label: 'question & answer' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer group">
                        <div
                          onClick={() => setCardTypes((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-all cursor-pointer ${
                            cardTypes[key as keyof typeof cardTypes]
                              ? 'bg-pink-500 border-pink-500'
                              : 'bg-white border-gray-300 group-hover:border-pink-400'
                          }`}
                        >
                          {cardTypes[key as keyof typeof cardTypes] && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm text-gray-600 select-none">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </main>

        ) : (
          /* ── Home view ── */
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">
              {/* Welcome Greeting */}
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-12">
                Welcome {user?.name || 'there'}
              </h1>

              {/* Subtitle */}
              <p className="text-gray-500 -mt-8 mb-8">Click or drag and drop a document here to generate flashcards and quizzes from it</p>

              {/* File Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                  isDragging ? 'border-pink-400 bg-pink-50' : 'border-pink-200 bg-white'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  accept=".pdf"
                />

                <button
                  onClick={handleClickUpload}
                  disabled={isUploading}
                  className="bg-pink-100 hover:bg-pink-200 text-pink-700 font-medium px-6 py-3 rounded-lg transition-colors mb-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Uploading...' : 'click to upload'}
                </button>

                <p className="text-gray-500 mb-8">or drag & drop files here</p>

                {/* Supported File Types */}
                <div className="flex flex-wrap justify-center items-center gap-6 text-sm">
                  <span className="text-gray-700">Supported Files:</span>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700">PDF</span>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              {(isUploading || (documents && documents.length > 0)) && (
                <div className="mt-10">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Your Documents</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">

                    {/* Uploading skeleton card */}
                    {isUploading && uploadingFileName && (
                      <div className="bg-white border border-pink-100 rounded-xl p-4 flex flex-col items-center gap-3 shadow-sm">
                        <div className="relative w-12 h-14 flex items-center justify-center">
                          <svg className="w-12 h-14 text-pink-200" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                            <path d="M14 2v6h6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-7 h-7 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                          </div>
                        </div>
                        <div className="w-full space-y-2 animate-pulse">
                          <div className="h-2.5 bg-pink-100 rounded-full w-3/4 mx-auto" />
                          <div className="h-2 bg-pink-50 rounded-full w-1/2 mx-auto" />
                        </div>
                        <p className="text-xs text-pink-400 font-medium tracking-wide animate-pulse">Reading document…</p>
                      </div>
                    )}

                    {/* Completed document cards */}
                    {documents?.map((doc) => (
                      <div
                        key={doc._id}
                        className="group relative bg-white border border-gray-100 hover:border-pink-200 rounded-xl p-4 flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition-all"
                      >
                        {/* 3-dot menu */}
                        <div className="absolute top-2 right-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === doc._id ? null : doc._id);
                            }}
                            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="5" r="1.5" />
                              <circle cx="12" cy="12" r="1.5" />
                              <circle cx="12" cy="19" r="1.5" />
                            </svg>
                          </button>
                          {openMenuId === doc._id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-7 z-20 bg-white border border-gray-100 rounded-lg shadow-lg py-1 w-36"
                            >
                              <button
                                onClick={() => { setOpenMenuId(null); setConfirmDeleteId(doc._id); }}
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

                        {/* Clickable card body */}
                        <button
                          onClick={() => setSelectedDocId(doc._id)}
                          className="flex flex-col items-center gap-3 w-full cursor-pointer"
                        >
                          <div className="relative w-12 h-14">
                            <svg className="w-12 h-14 text-pink-300" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                              <path d="M14 2v6h6" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-white tracking-widest">PDF</span>
                          </div>
                          <div className="w-full text-center">
                            <p className="text-xs font-medium text-gray-700 truncate w-full" title={doc.name}>
                              {doc.name}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </button>
                      </div>
                    ))}

                  </div>
                </div>
              )}

            </div>
          </main>
        )}
      </div>

      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => !isDeleting && setConfirmDeleteId(null)}
          />
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Delete document?</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  This will permanently remove the file. This action can't be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDeleteId(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade popup */}
      {showUpgradePopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowUpgradePopup(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 text-center">Upgrade to unlock</h2>
            <p className="text-sm text-gray-500 text-center">
              Medium and High card counts are available on paid plans. Upgrade to generate more flashcards per session.
            </p>
            <button
              type="button"
              onClick={() => setShowUpgradePopup(false)}
              className="w-full py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}

