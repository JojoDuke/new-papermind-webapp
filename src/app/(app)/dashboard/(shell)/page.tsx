'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';
import toast from 'react-hot-toast';
import { openPricingModal } from '@/components/app/pricing-modal-context';
import { useAuthToken } from '@convex-dev/auth/react';
import { UploadSuccessModal } from '@/components/app/UploadSuccessModal';
import { dashboardMainClass } from '@/components/app/dashboard-page-styles';
import { setCheckoutAccessGrace } from '@/lib/checkout-grace';
import { isUpgradeRequiredError } from '@/lib/upgrade-required';

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
  const [uploadSuccessDocId, setUploadSuccessDocId] = useState<Id<'documents'> | null>(null);
  const [uploadSuccessDocName, setUploadSuccessDocName] = useState<string>('');

  const cardCountMap = { low: '5', medium: '8', high: '12' };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = useQuery(api.auth.currentUser);
  const welcomeName =
    user?.name?.trim().split(/\s+/)[0] ||
    user?.email?.split('@')[0] ||
    'there';
  const documents = useQuery(api.documents.listDocuments);
  const quota = useQuery(api.usageQuota.getMyQuota);
  const progressSummary = useQuery(api.progress.getUserProgressSummary);
  const selectedDoc = useQuery(
    api.documents.getDocument,
    selectedDocId ? { documentId: selectedDocId } : 'skip'
  );
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const saveDocument = useMutation(api.documents.saveDocument);
  const deleteDocument = useMutation(api.documents.deleteDocument);
  const generateStubDeck = useMutation(api.flashcards.generateStubDeck);
  const authToken = useAuthToken();
  const checkoutSynced = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !authToken || checkoutSynced.current) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') !== 'success') {
      return;
    }
    const checkoutId =
      params.get('checkout_id') ?? params.get('session_id');
    checkoutSynced.current = true;
    if (!checkoutId) {
      router.replace('/dashboard');
      return;
    }
    fetch('/api/polar/verify-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ checkoutId }),
    })
      .then(async (res) => {
        if (res.ok) {
          const data = (await res.json()) as { ok?: boolean };
          if (data.ok) setCheckoutAccessGrace();
        }
      })
      .catch(() => {})
      .finally(() => {
        router.replace('/dashboard');
      });
  }, [authToken, router]);

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

  const isDuplicateDocument = (fileName: string) =>
    documents?.some(
      (doc) => doc.name.trim().toLowerCase() === fileName.trim().toLowerCase()
    ) ?? false;

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (isDuplicateDocument(file.name)) {
      toast.error('This file is already in your documents.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (
      quota &&
      !quota.isPaid &&
      quota.documents.limit !== null &&
      quota.documents.used >= quota.documents.limit
    ) {
      openPricingModal({
        title: 'Upgrade to upload more documents',
        subtitle: `Free accounts can upload up to ${quota.documents.limit} documents. Upgrade for unlimited uploads.`,
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

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

      // Fire-and-forget: count pages in the background
      if (authToken) {
        fetch('/api/documents/count-pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ documentId }),
        }).catch(() => {/* non-critical, fail silently */});
      }

      setUploadSuccessDocName(file.name);
      setUploadSuccessDocId(documentId);
    } catch (err) {
      if (isUpgradeRequiredError(err)) {
        openPricingModal({
          title: 'Upgrade to upload more documents',
          subtitle: 'Free accounts can upload up to 2 documents. Upgrade for unlimited uploads.',
        });
      } else {
        const message = err instanceof Error ? err.message : 'Upload failed. Please try again.';
        toast.error(message);
        console.error(err);
      }
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
          if (res.status === 402 || err.error === 'upgrade_required') {
            openPricingModal({ title: 'Unlock more flashcard decks', subtitle: err.message ?? 'Upgrade to create more flashcard decks.' });
            return;
          }
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
    <>
      {selectedDocId ? (
          /* ── Generation config view ── */
          <main className={dashboardMainClass}>
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
                          onClick={() =>
                            isLow ? setCardCount(level) : openPricingModal({
                              title: 'Upgrade to unlock',
                              subtitle: 'Medium and High card counts are available on paid plans.',
                            })
                          }
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
          <main className={`${dashboardMainClass}`}>
            <header className="mb-5 md:mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary mb-1.5">
                Welcome back, {welcomeName} 👋
              </h1>
              <p className="text-sm text-text-muted">
                Upload a document here to generate study material from it
              </p>
            </header>

            {/* File Upload Area — full width */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              tabIndex={-1}
              className={`border-2 border-dashed rounded-xl p-6 sm:p-10 flex flex-col items-center text-center outline-none focus:outline-none ${
                isDragging ? 'border-pink-400 bg-pink-50 dark:bg-pink-950/30' : 'border-pink-200 bg-surface-card'
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
                className="bg-pink-500 hover:bg-pink-600 text-white font-medium px-6 py-3 rounded-full transition-colors mb-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : 'Click to upload'}
              </button>

              <p className="text-sm text-text-muted mb-8">or drag & drop files here</p>

              {/* Supported File Types */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                <span className="text-text-secondary">Supported Files:</span>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-text-secondary">PDF</span>
                </div>
              </div>
            </div>

            {/* Two-column layout starts here: left = docs/tools, right = progress */}
            <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch mt-8 md:mt-10">
            <div className="flex-1 min-w-0 flex flex-col gap-0">

              {/* Documents Section */}
              {(isUploading || (documents && documents.length > 0)) && (
                <div>
                  <h2 className="text-sm font-semibold text-text-primary mb-4">Your Documents</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">

                    {/* Uploading skeleton card */}
                    {isUploading && uploadingFileName && (
                      <div className="bg-surface-card border border-pink-100 rounded-xl p-5 flex flex-col items-center gap-3 shadow-sm">
                        <div className="relative w-14 h-16 flex items-center justify-center">
                          <svg className="w-14 h-16 text-pink-200" fill="currentColor" viewBox="0 0 24 24">
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
                        <p className="text-xs text-pink-400 font-medium tracking-wide animate-pulse">
                          Reading document…
                        </p>
                      </div>
                    )}

                    {/* Completed document cards */}
                    {documents?.map((doc) => (
                      <div
                        key={doc._id}
                        className="group relative bg-surface-card border border-border-default hover:border-pink-300 rounded-xl p-5 flex flex-col items-center gap-3 transition-colors"
                      >
                        {/* 3-dot menu */}
                        <div className="absolute top-3 right-3">
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
                              className="absolute right-0 top-7 z-20 bg-surface-card border border-border-subtle rounded-lg shadow-lg py-1 w-36"
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
                          className="flex flex-col items-center gap-3 w-full cursor-pointer pt-2"
                        >
                          <div className="relative w-14 h-16">
                            <svg className="w-14 h-16 text-pink-300" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                              <path d="M14 2v6h6" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 text-[7px] font-bold text-white tracking-wide">PDF</span>
                          </div>
                          <div className="w-full text-center">
                            <p className="text-xs font-medium text-text-secondary truncate w-full" title={doc.name}>
                              {doc.name}
                            </p>
                            <p className="text-[10px] text-text-faint mt-0.5">
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </button>
                      </div>
                    ))}

                  </div>
                </div>
              )}

              {/* Continue Studying */}
              <div className="mt-10">
                <h2 className="text-sm font-semibold text-text-primary mb-4">Continue Studying</h2>
                {progressSummary && progressSummary.continueStudying.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {progressSummary.continueStudying.map((item) => (
                      <button
                        key={`${item.type}-${item.deckId}`}
                        type="button"
                        onClick={() =>
                          router.push(
                            item.type === 'flashcard'
                              ? `/dashboard/flashcards/${item.deckId}`
                              : `/dashboard/quizzes/${item.deckId}`
                          )
                        }
                        className="bg-surface-card border border-border-default rounded-2xl p-4 flex flex-col gap-2 text-left hover:border-pink-200 transition-all cursor-pointer"
                      >
                        <p className="text-sm font-semibold text-text-primary truncate">{item.title}</p>
                        <p className="text-xs text-text-faint capitalize">{item.type === 'flashcard' ? 'Flashcards' : 'Quiz'}</p>
                        <div className="h-1.5 w-full bg-surface-subtle rounded-full overflow-hidden">
                          <div
                            className="h-full bg-pink-400 rounded-full"
                            style={{ width: `${Math.round(item.progress * 100)}%` }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-surface-card border border-border-default rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-2">
                    <svg className="w-8 h-8 text-border-strong mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p className="text-sm font-medium text-text-secondary">No decks in progress</p>
                    <p className="text-xs text-text-faint">Generate study materials from a document to get started.</p>
                  </div>
                )}
              </div>

              {/* Study Tools */}
              <div className="mt-10">
                <h2 className="text-sm font-semibold text-text-primary mb-4">Study Tools</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">

                  {/* Flashcards */}
                  <div
                    onClick={() => router.push('/dashboard/flashcards')}
                    className="bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-900/40 rounded-2xl py-6 sm:py-10 flex flex-col items-center text-center gap-2 sm:gap-3 cursor-pointer hover:border-pink-300 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-surface-card flex items-center justify-center shrink-0 shadow-sm">
                      <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-semibold text-text-primary">Flashcards</p>
                      <p className="text-xs text-text-faint">Smart cards<br />that adapt</p>
                    </div>
                  </div>

                  {/* Quizzes */}
                  <div
                    onClick={() => router.push('/dashboard/quizzes')}
                    className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl py-6 sm:py-10 flex flex-col items-center text-center gap-2 sm:gap-3 cursor-pointer hover:border-amber-300 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-surface-card flex items-center justify-center shrink-0 shadow-sm">
                      <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-semibold text-text-primary">Quizzes</p>
                      <p className="text-xs text-text-faint">Generate quizzes<br />to test yourself</p>
                    </div>
                  </div>

                  {/* Study Guides */}
                  <div
                    onClick={() => router.push('/dashboard/study-guides')}
                    className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 rounded-2xl py-6 sm:py-10 flex flex-col items-center text-center gap-2 sm:gap-3 cursor-pointer hover:border-green-300 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-surface-card flex items-center justify-center shrink-0 shadow-sm">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-semibold text-text-primary">Study Guides</p>
                      <p className="text-xs text-text-faint">AI-generated<br />summaries</p>
                    </div>
                  </div>

                  {/* Mock Exams */}
                  <div
                    onClick={() =>
                      openPricingModal({
                        title: 'Unlock Mock Exams',
                        subtitle: 'Full-length practice exams are included with a paid plan. Upgrade to get started.',
                      })
                    }
                    className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 rounded-2xl py-6 sm:py-10 flex flex-col items-center text-center gap-2 sm:gap-3 cursor-pointer hover:border-purple-300 transition-all group opacity-90"
                  >
                    <div className="w-10 h-10 rounded-xl bg-surface-card flex items-center justify-center shrink-0 shadow-sm">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-semibold text-text-primary">Mock Exams</p>
                      <p className="text-xs text-text-faint">Realistic practice<br />exams</p>
                    </div>
                  </div>

              </div>
            </div>

            </div>{/* end left column */}

            {/* Progress panel — right column */}
            <div className="w-full lg:w-64 shrink-0 flex flex-col">

              {/* Your progress */}
              <div className="bg-surface-card border border-border-subtle rounded-2xl p-5 flex flex-col justify-between h-full">
                <h2 className="text-sm font-semibold text-text-primary">Your progress</h2>

                <div>
                  <p className="text-xs text-text-faint mb-1">Overall progress</p>
                  <p className="text-3xl font-bold text-text-primary mb-2">
                    {progressSummary?.overallProgress ?? 0}%
                  </p>
                  <div className="w-full h-2 bg-surface-subtle rounded-full overflow-hidden">
                    <div
                      className="h-full bg-pink-400 rounded-full transition-all"
                      style={{ width: `${progressSummary?.overallProgress ?? 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Cards mastered', value: String(progressSummary?.cardsMastered ?? 0), icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                    { label: 'Quizzes taken', value: String(progressSummary?.quizzesTaken ?? 0), icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <svg className="w-4 h-4 text-border-strong" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                        </svg>
                        {label}
                      </div>
                      <span className="text-xs font-semibold text-text-secondary">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-border-subtle" />

                {/* Motivational card */}
                <div className="bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900/40 rounded-xl overflow-hidden flex items-end">
                  <img
                    src="/assets/foxLeftSidebar.png"
                    alt="Papermind fox"
                    className="w-20 h-20 object-contain object-bottom shrink-0 mix-blend-multiply dark:mix-blend-normal translate-y-2"
                  />
                  <div className="flex-1 py-4 pr-4 pl-1">
                    <p className="text-sm font-bold text-text-primary mb-1">You&apos;ve got this!</p>
                    <p className="text-xs text-text-muted leading-relaxed">Every study session brings you closer to your goal.</p>
                  </div>
                </div>
              </div>

            </div>{/* end right column */}

            </div>{/* end two-column wrapper */}

          </main>
        )}

      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => !isDeleting && setConfirmDeleteId(null)}
          />
          {/* Modal */}
          <div className="relative bg-surface-card rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Delete document?</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  This will permanently remove the file. This action can't be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDeleteId(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary border border-border-default rounded-lg hover:bg-surface-subtle transition-all cursor-pointer disabled:opacity-50"
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

      {/* Upload success modal */}
      {uploadSuccessDocId && (
        <UploadSuccessModal
          documentName={uploadSuccessDocName}
          onClose={() => setUploadSuccessDocId(null)}
          onGenerateFlashcards={() => {
            setUploadSuccessDocId(null);
            router.push(`/dashboard/flashcards?documentId=${uploadSuccessDocId}`);
          }}
          onGenerateQuizzes={() => {
            setUploadSuccessDocId(null);
            router.push(`/dashboard/quizzes?documentId=${uploadSuccessDocId}`);
          }}
        />
      )}
    </>
  );
}

