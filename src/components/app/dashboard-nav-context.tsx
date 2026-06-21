'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type TopBarBackAction = {
  onClick: () => void;
  label?: string;
};

type DashboardNavContextValue = {
  mobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  topBarBack: TopBarBackAction | null;
  setTopBarBack: (action: TopBarBackAction | null) => void;
};

const DashboardNavContext = createContext<DashboardNavContextValue | null>(null);

export function DashboardNavProvider({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [topBarBack, setTopBarBackState] = useState<TopBarBackAction | null>(null);

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);
  const openMobileNav = useCallback(() => setMobileNavOpen(true), []);
  const setTopBarBack = useCallback((action: TopBarBackAction | null) => {
    setTopBarBackState(action);
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  const value = useMemo(
    () => ({ mobileNavOpen, openMobileNav, closeMobileNav, topBarBack, setTopBarBack }),
    [mobileNavOpen, openMobileNav, closeMobileNav, topBarBack, setTopBarBack]
  );

  return (
    <DashboardNavContext.Provider value={value}>{children}</DashboardNavContext.Provider>
  );
}

export function useDashboardNav() {
  const ctx = useContext(DashboardNavContext);
  if (!ctx) {
    throw new Error('useDashboardNav must be used within DashboardNavProvider');
  }
  return ctx;
}
