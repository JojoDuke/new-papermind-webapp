'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAuthToken } from '@convex-dev/auth/react';
import type { Id } from '../../../convex/_generated/dataModel';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

type StudyGuideChatPanelProps = {
  guideId: Id<'studyGuides'>;
  guideTitle: string;
  isOpen: boolean;
  onClose: () => void;
};

const SUGGESTED_PROMPTS = [
  'Explain this in simpler terms',
  'Give me a real-world example',
  'What should I remember for an exam?',
];

export function StudyGuideChatPanel({
  guideId,
  guideTitle,
  isOpen,
  onClose,
}: StudyGuideChatPanelProps) {
  const authToken = useAuthToken();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hi! I'm Paige. Ask me anything about "${guideTitle}" and I'll help you understand it.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    if (!authToken) {
      setError('Please sign in to chat.');
      return;
    }

    setError(null);
    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/study-guides/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ guideId, messages: nextMessages }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? 'Something went wrong');
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      setMessages((prev) => prev.slice(0, -1));
      setInput(trimmed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
      <aside
        className={`fixed top-0 right-0 z-40 h-full bg-surface-card border-l border-border-default shadow-xl flex flex-col transition-transform duration-300 ease-out w-full max-w-[400px] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Image
              src="/assets/foxLeftSidebar.png"
              alt=""
              width={36}
              height={36}
              className="object-contain shrink-0 mix-blend-multiply dark:mix-blend-normal"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">Ask Paige</p>
              <p className="text-[11px] text-text-faint truncate">About this study guide</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-text-faint hover:bg-surface-subtle hover:text-text-secondary transition-colors cursor-pointer"
            aria-label="Close chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-green-600 text-white rounded-br-md'
                    : 'bg-green-50 dark:bg-green-950/20 text-text-primary border border-green-100 dark:border-green-900/40 rounded-bl-md'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/40 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
        </div>

        {messages.length <= 1 && !isLoading && (
          <div className="px-4 pb-2 flex flex-wrap gap-2 shrink-0">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                className="text-xs px-3 py-1.5 rounded-full border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className="px-4 text-xs text-red-500 shrink-0">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="p-4 border-t border-border-subtle shrink-0">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question…"
              rows={2}
              disabled={isLoading}
              className="flex-1 resize-none rounded-xl border border-border-default bg-surface-card px-3 py-2.5 text-sm text-text-primary placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Send message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-text-faint mt-2">Enter to send · Shift+Enter for new line</p>
        </form>
      </aside>
  );
}

/** Vertical tab to open the chat panel from the right edge. */
export function StudyGuideChatToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-30 flex items-center gap-1.5 pl-3 pr-2 py-3 rounded-l-xl bg-green-600 text-white text-sm font-semibold shadow-lg hover:bg-green-700 transition-colors cursor-pointer"
      aria-label="Open AI chat"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      <span className="hidden sm:inline">Ask AI</span>
    </button>
  );
}
