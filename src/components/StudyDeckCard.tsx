'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { Id } from '../../convex/_generated/dataModel';

export type StudyDeckCardProps = {
  deckId: Id<'flashcardDecks'>;
  title: string;
  cardCount: number;
  /** 0–1 study progress; placeholder until tracking exists */
  progress: number;
  userInitial: string;
  onDelete?: () => Promise<void>;
  onRename?: (newName: string) => Promise<void>;
};

export function StudyDeckCard({
  deckId,
  title,
  cardCount,
  progress,
  userInitial,
  onDelete,
  onRename,
}: StudyDeckCardProps) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menuOpen]);

  // Keep local rename value in sync if title changes externally
  useEffect(() => {
    if (!isRenaming) setRenameValue(title);
  }, [title, isRenaming]);

  // Auto-focus + select all when entering rename mode
  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isRenaming]);

  const commitRename = async () => {
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === title) {
      setRenameValue(title);
      setIsRenaming(false);
      return;
    }
    await onRename?.(trimmed);
    setIsRenaming(false);
  };

  const cancelRename = () => {
    setRenameValue(title);
    setIsRenaming(false);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <div className="relative group shrink-0 w-[158px] flex flex-col gap-2">
        {/* Thumbnail + progress bar — always a link */}
        <Link
          href={`/dashboard/flashcards/${deckId}`}
          className="flex flex-col gap-2 cursor-pointer"
          tabIndex={isRenaming ? -1 : 0}
        >
          <div className="relative w-full pt-1 pl-1">
            <div
              className="absolute top-2 left-2 right-0 bottom-0 rounded-xl bg-white border border-gray-200/80 shadow-sm"
              aria-hidden
            />
            <div className="relative aspect-square rounded-xl bg-gradient-to-br from-pink-50 via-white to-purple-100 border border-gray-200 shadow-sm overflow-hidden group-hover:shadow-md transition-shadow">
              <div className="absolute inset-0 flex items-center justify-center opacity-40">
                <svg className="w-14 h-14 text-pink-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                </svg>
              </div>
              <div
                className="absolute bottom-1.5 right-1.5 w-8 h-8 rounded-full bg-white border-2 border-white shadow-md flex items-center justify-center text-xs font-semibold text-pink-600"
                title="You"
              >
                {userInitial}
              </div>
            </div>
          </div>

          <div className="px-0.5">
            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </Link>

        {/* Title — inline-editable when renaming, otherwise a link */}
        {isRenaming ? (
          <input
            ref={inputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); commitRename(); }
              if (e.key === 'Escape') { e.preventDefault(); cancelRename(); }
            }}
            maxLength={80}
            className="text-sm font-medium text-gray-800 leading-tight px-1.5 py-0.5 rounded-lg border border-pink-400 ring-2 ring-pink-200 outline-none w-full min-h-[2.5rem] bg-white"
          />
        ) : (
          <Link
            href={`/dashboard/flashcards/${deckId}`}
            className="text-sm font-medium text-gray-800 leading-tight line-clamp-2 min-h-[2.5rem] px-0.5 cursor-pointer"
          >
            {title}
          </Link>
        )}

        {/* Card count */}
        <div className="flex items-center gap-3 text-[11px] text-gray-400 px-0.5">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            {cardCount}
          </span>
        </div>

        {/* 3-dot menu */}
        {(onDelete || onRename) && (
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-all cursor-pointer"
              aria-label="Deck options"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>

            {menuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-7 z-20 bg-white border border-gray-100 rounded-lg shadow-lg py-1 w-36"
              >
                {onRename && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setRenameValue(title);
                      setIsRenaming(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Rename
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setConfirmOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => !isDeleting && setConfirmOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-80 max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-gray-900 mb-1">Delete deck?</h3>
            <p className="text-sm text-gray-500 mb-5">
              &ldquo;{title}&rdquo; and all its cards will be permanently deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-70 flex items-center gap-2 cursor-pointer"
              >
                {isDeleting && (
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
