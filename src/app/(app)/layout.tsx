import type { Metadata } from 'next';
import { NO_INDEX_METADATA } from '@/lib/site';
import { ProtectedRoute } from '@/components/app/ProtectedRoute';

export const metadata: Metadata = NO_INDEX_METADATA;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
