'use client';

import type { ReactNode } from 'react';
import { DashboardNavProvider } from '@/components/app/dashboard-nav-context';
import { DashboardSidebar } from '@/components/app/DashboardSidebar';
import { DashboardTopBar } from '@/components/app/DashboardTopBar';
import { PricingModalProvider } from '@/components/app/pricing-modal-context';

type DashboardAppShellProps = {
  children: ReactNode;
  className?: string;
};

/** Dashboard layout: sidebar + main content + shared pricing modal. */
export function DashboardAppShell({ children, className }: DashboardAppShellProps) {
  return (
    <PricingModalProvider>
      <DashboardNavProvider>
        <div
          className={`flex h-[100dvh] bg-gray-50 overflow-hidden ${className ?? ''}`}
        >
          <DashboardSidebar />
          <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
            <DashboardTopBar />
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              {children}
            </div>
          </div>
        </div>
      </DashboardNavProvider>
    </PricingModalProvider>
  );
}
