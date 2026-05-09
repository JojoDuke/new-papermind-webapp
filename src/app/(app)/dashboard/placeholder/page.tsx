'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** @deprecated Use /dashboard/study-decks */
export default function PlaceholderRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/study-decks');
  }, [router]);
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-500">
      Redirecting…
    </div>
  );
}
