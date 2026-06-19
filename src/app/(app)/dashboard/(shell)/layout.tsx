import type { ReactNode } from 'react';
import { DashboardAppShell } from '@/components/app/DashboardAppShell';

export default function DashboardShellLayout({ children }: { children: ReactNode }) {
  return <DashboardAppShell>{children}</DashboardAppShell>;
}
