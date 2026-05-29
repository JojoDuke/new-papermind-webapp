'use client';

import { ProtectedRoute } from '@/components/app/ProtectedRoute';
import { DashboardAppShell } from '@/components/app/DashboardAppShell';
import { dashboardMainClass } from '@/components/app/dashboard-page-styles';

export default function DashboardSettingsPage() {
  return (
    <ProtectedRoute>
      <DashboardAppShell>
        <main className={dashboardMainClass}>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-sm text-gray-500">Account and app preferences will appear here.</p>
        </main>
      </DashboardAppShell>
    </ProtectedRoute>
  );
}
