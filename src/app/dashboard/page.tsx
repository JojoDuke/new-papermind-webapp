'use client';

import { useAuthActions } from '@convex-dev/auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useState, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function DashboardPage() {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = useQuery(api.auth.currentUser);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      // Handle file upload logic here
      console.log('Files selected:', files);
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
      <div className="flex min-h-screen bg-gray-50">
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

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Welcome Greeting */}
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-12">
              Welcome {user?.name || 'there'}
            </h1>

            {/* Top Divs */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 bg-pink-100 rounded-lg min-h-[100px] p-6 flex items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-900">📚 Study Space</h2>
              </div>
              <div className="flex-1 bg-pink-100 rounded-lg min-h-[100px] p-6 flex items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-900">🎯 Exam Prep</h2>
              </div>
            </div>

            {/* File Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                isDragging ? 'border-green-400 bg-green-50' : 'border-green-200 bg-white'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
                accept=".pdf"
              />
              
              <button
                onClick={handleClickUpload}
                className="bg-green-100 hover:bg-green-200 text-green-800 font-medium px-6 py-3 rounded-lg transition-colors mb-4"
              >
                click to upload
              </button>
              
              <p className="text-gray-700 mb-8">or drag & drop files here</p>

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
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

