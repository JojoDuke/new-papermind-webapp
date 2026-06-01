'use client';

import { useState } from 'react';

type BlogPostMetaProps = {
  author: string;
  formattedDate: string;
  readTime: string;
  slug: string;
};

export function BlogPostMeta({ author, formattedDate, readTime, slug }: BlogPostMetaProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const url = `${window.location.origin}/blog/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="font-sans">
      <p className="text-sm font-medium text-gray-900 mb-1.5">By {author}</p>
      <div className="flex flex-wrap items-center gap-x-2 text-sm text-gray-400">
        <span>{formattedDate}</span>
        <span aria-hidden="true">·</span>
        <span>{readTime}</span>
        <span aria-hidden="true">·</span>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>
    </div>
  );
}
