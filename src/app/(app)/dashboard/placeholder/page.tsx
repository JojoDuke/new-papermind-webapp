'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** @deprecated Use /dashboard/flashcards */
export default function PlaceholderRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/flashcards');
  }, [router]);
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-500">
      Redirecting…
    </div>
  );
}
