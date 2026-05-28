'use client';

import type { ReactNode } from 'react';
import { DashboardSidebar } from '@/components/app/DashboardSidebar';
import { PricingModalProvider } from '@/components/app/pricing-modal-context';

type DashboardAppShellProps = {
  children: ReactNode;
  className?: string;
};

/** Dashboard layout: sidebar + main content + shared pricing modal. */
export function DashboardAppShell({ children, className }: DashboardAppShellProps) {
  return (
    <PricingModalProvider>
      <div className={`flex h-screen bg-gray-50 overflow-hidden ${className ?? ''}`}>
        <DashboardSidebar />
        {children}
      </div>
    </PricingModalProvider>
  );
}
