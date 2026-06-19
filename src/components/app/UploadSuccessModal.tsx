'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface UploadSuccessModalProps {
  documentName: string;
  onClose: () => void;
  onGenerateFlashcards: () => void;
  onGenerateQuizzes: () => void;
}

export function UploadSuccessModal({
  documentName,
  onClose,
  onGenerateFlashcards,
  onGenerateQuizzes,
}: UploadSuccessModalProps) {
  const router = useRouter();

  const handleGoToLibrary = () => {
    onClose();
    router.push('/dashboard/study-guides');
  };

  const handleGenerateMore = () => {
    onClose();
    onGenerateFlashcards();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pb-4 overflow-y-auto bg-black/40 backdrop-blur-sm">
      <div className="relative bg-surface-card rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-visible mt-8 sm:mt-16 animate-modal-bounce">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-surface-subtle hover:bg-border-default transition-colors text-text-muted cursor-pointer"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex justify-center">
          <Image
            src="/assets/foxCongrats.png"
            alt="Papermind fox"
            width={220}
            height={220}
            priority
            className="object-contain -mt-16 sm:-mt-24 w-[180px] sm:w-[220px] h-auto drop-shadow-xl"
          />
        </div>

        <div className="px-6 pb-6">
          <div className="text-center mb-1">
            <span className="text-pink-500 mr-1">✦</span>
            <span className="text-xl font-serif font-bold text-text-primary">Your document has been added!</span>
            <span className="text-pink-500 ml-1">✦</span>
          </div>
          <p className="text-center text-[13px] text-text-muted mb-5">
            <span className="font-semibold text-[#e63f6e]">
              {documentName.length > 30 ? documentName.slice(0, 30) + '…' : documentName}
            </span>
            {' '}is ready. Choose what to generate from it below.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <button
              onClick={handleGoToLibrary}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-border-subtle bg-surface-subtle hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-950/30 transition-colors group cursor-pointer"
            >
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-text-secondary">Study Guides</p>
                <p className="text-[10px] text-green-600 font-medium leading-tight">Generate from doc</p>
              </div>
            </button>

            <button
              onClick={handleGenerateMore}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-border-subtle bg-surface-subtle hover:bg-pink-50 hover:border-pink-200 dark:hover:bg-pink-950/30 transition-colors group cursor-pointer"
            >
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-text-secondary">Flashcards</p>
                <p className="text-[10px] text-pink-500 font-medium leading-tight">Generate in one click</p>
              </div>
            </button>

            <button
              onClick={onGenerateQuizzes}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-border-subtle bg-surface-subtle hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-950/30 transition-colors group cursor-pointer"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-text-secondary">Quizzes</p>
                <p className="text-[10px] text-purple-500 font-medium leading-tight">Generate quiz from doc</p>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-3 bg-pink-50 dark:bg-pink-950/30 rounded-2xl px-4 py-3 mb-5">
            <Image src="/assets/foxLeftSidebar.png" alt="" width={32} height={32} className="object-contain shrink-0" />
            <div>
              <p className="text-xs font-semibold text-text-secondary">All materials will be saved to your library.</p>
              <p className="text-[11px] text-text-faint">You can access and review them anytime.</p>
            </div>
            <span className="ml-auto text-pink-300 text-lg">✦</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGoToLibrary}
              className="flex-1 py-3 rounded-2xl border-2 border-[#e63f6e] text-[#e63f6e] text-sm font-semibold hover:bg-pink-50 transition-colors cursor-pointer"
            >
              Go to My Library
            </button>
            <button
              onClick={handleGenerateMore}
              className="flex-1 py-3 rounded-2xl bg-[#e63f6e] text-white text-sm font-semibold hover:bg-[#d03560] transition-colors cursor-pointer"
            >
              Generate More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
