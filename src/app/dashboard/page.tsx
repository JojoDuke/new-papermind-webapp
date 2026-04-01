'use client';

import { useAuthActions } from '@convex-dev/auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import dynamic from 'next/dynamic';

const PdfViewer = dynamic(
  () => import('@/components/PdfViewer').then((m) => m.PdfViewer),
  { ssr: false, loading: () => (
    <div className="h-full flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-pink-300 border-t-transparent rounded-full animate-spin" />
    </div>
  )}
);
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<Id<'documents'> | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<Id<'documents'> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<Id<'documents'> | null>(null);
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

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
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
      await saveDocument({ storageId, name: file.name });
      toast.success(`"${file.name}" uploaded successfully!`);
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

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}>
          {/* Logo and Collapse Button */}
          <div className="p-4 flex items-center justify-between">
            <div 
              onClick={isSidebarCollapsed ? () => setIsSidebarCollapsed(false) : undefined}
              className={`${isSidebarCollapsed ? 'cursor-ew-resize group' : ''} relative shrink-0`}
            >
              {/* Logo visible by default, icon on hover when collapsed */}
              <div className="relative w-8 h-8">
                <div className={`absolute inset-0 -m-2 rounded-lg transition-all duration-200 ${isSidebarCollapsed ? 'group-hover:bg-pink-50' : 'bg-transparent'}`} />
                <Image 
                  src="/logos-icons/pmIcon.png" 
                  alt="Papermind Icon" 
                  width={32} 
                  height={32}
                  className={`w-8 h-8 relative z-10 transition-opacity duration-200 ${isSidebarCollapsed ? 'group-hover:opacity-0' : ''}`}
                  priority
                />
                <Image 
                  src="/logos-icons/layouting.png"
                  alt="Toggle sidebar"
                  width={24}
                  height={24}
                  className={`w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 transition-opacity duration-200 ${isSidebarCollapsed ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 pointer-events-none'}`}
                  priority
                />
              </div>
              {/* Stylized Tooltip - only when collapsed */}
              <div className={`absolute left-full ml-6 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-white text-gray-900 text-xs rounded-md transition-all duration-200 whitespace-nowrap pointer-events-none z-50 shadow-md border border-gray-200 ${isSidebarCollapsed ? 'opacity-0 invisible group-hover:opacity-100 group-hover:visible' : 'opacity-0 invisible'}`}>
                Toggle sidebar
              </div>
            </div>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`hover:opacity-70 transition-all duration-200 cursor-pointer shrink-0 ${isSidebarCollapsed ? 'opacity-0 invisible w-0' : 'opacity-100 visible'}`}
              aria-label="Collapse sidebar"
            >
              <Image 
                src="/logos-icons/layouting.png"
                alt="Toggle sidebar"
                width={16}
                height={16}
                className="w-4 h-4"
              />
            </button>
          </div>

          {/* Navigation Items - Add your nav items here */}
          <nav className="flex-1 p-4 space-y-7">
            {/* Homepage Navigation Item - Active */}
            <Link
              href="/dashboard"
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                pathname === '/dashboard'
                  ? 'bg-pink-50 text-pink-700 hover:bg-pink-100'
                  : 'text-gray-700 hover:bg-gray-100'
              } ${isSidebarCollapsed ? 'justify-center' : ''}`}
            >
              {/* Home Icon */}
              <svg
                className={`w-5 h-5 shrink-0 ${
                  pathname === '/dashboard' ? 'text-pink-600' : 'text-gray-700'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              {/* Homepage Text - hidden when collapsed */}
              {!isSidebarCollapsed && (
                <span className={`text-sm font-medium ${
                  pathname === '/dashboard' ? 'text-pink-700' : 'text-gray-700'
                }`}>
                  Homepage
                </span>
              )}
              {/* Tooltip - only when collapsed */}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-6 px-2.5 py-1.5 bg-white text-gray-900 text-xs rounded-md transition-all duration-200 whitespace-nowrap pointer-events-none z-50 shadow-md border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible">
                  Homepage
                </div>
              )}
            </Link>

            {/* Placeholder Navigation Item - Inactive */}
            <Link
              href="/dashboard/placeholder"
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                pathname === '/dashboard/placeholder'
                  ? 'bg-pink-50 text-pink-700 hover:bg-pink-100'
                  : 'text-gray-700 hover:bg-gray-100'
              } ${isSidebarCollapsed ? 'justify-center' : ''}`}
            >
              {/* Placeholder Icon */}
              <svg
                className={`w-5 h-5 shrink-0 ${
                  pathname === '/dashboard/placeholder' ? 'text-pink-600' : 'text-gray-700'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {/* Placeholder Text - hidden when collapsed */}
              {!isSidebarCollapsed && (
                <span className={`text-sm font-medium ${
                  pathname === '/dashboard/placeholder' ? 'text-pink-700' : 'text-gray-700'
                }`}>
                  Placeholder
                </span>
              )}
              {/* Tooltip - only when collapsed */}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-6 px-2.5 py-1.5 bg-white text-gray-900 text-xs rounded-md transition-all duration-200 whitespace-nowrap pointer-events-none z-50 shadow-md border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible">
                  Placeholder
                </div>
              )}
            </Link>
          </nav>

          {/* Logout Button at Bottom */}
          {!isSidebarCollapsed && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}
        </aside>

        {selectedDocId ? (
          /* ── Document view ── */
          <main className="flex-1 overflow-y-auto p-8">
            {/* Back button */}
            <button
              onClick={() => setSelectedDocId(null)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors cursor-pointer mb-5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            {/* Contained card */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden flex" style={{ height: 'calc(100vh - 10rem)' }}>

              {/* Left — PDF viewer (70%) */}
              <div className="flex flex-col border-r border-gray-200 overflow-hidden" style={{ width: '70%' }}>
                {selectedDoc === undefined ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-7 h-7 border-2 border-pink-300 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-gray-400">Loading document…</p>
                    </div>
                  </div>
                ) : selectedDoc?.url ? (
                  <PdfViewer url={selectedDoc.url} />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-sm text-gray-400">Could not load document.</p>
                  </div>
                )}
              </div>

              {/* Right — Tools panel (30%) */}
              <div className="flex flex-col p-6 gap-5 overflow-y-auto bg-white" style={{ width: '30%' }}>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Study Tools</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Generate study materials from this document.</p>
                </div>

                <button
                  disabled={!selectedDoc}
                  className="w-full flex items-center gap-3 px-4 py-3.5 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="w-8 h-8 bg-pink-200 group-hover:bg-pink-300 rounded-lg flex items-center justify-center shrink-0 transition-colors">
                    <svg className="w-4 h-4 text-pink-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-pink-800">Generate Flashcards</p>
                    <p className="text-[11px] text-pink-400 mt-0.5">Turn key concepts into cards</p>
                  </div>
                </button>
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
    </ProtectedRoute>
  );
}

