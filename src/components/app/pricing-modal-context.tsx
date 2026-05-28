'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { PricingModal } from '@/components/app/PricingModal';

type PricingModalOptions = {
  title?: string;
  subtitle?: string;
};

type PricingModalContextValue = {
  openPricingModal: (options?: PricingModalOptions) => void;
};

const PricingModalContext = createContext<PricingModalContextValue | null>(null);

let openPricingModalGlobal: ((opts?: PricingModalOptions) => void) | null = null;

/** Open pricing from anywhere under PricingModalProvider (no hook required). */
export function openPricingModal(opts?: PricingModalOptions) {
  openPricingModalGlobal?.(opts);
}

export function PricingModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<PricingModalOptions>({});

  const openPricingModalFn = useCallback((opts?: PricingModalOptions) => {
    setOptions(opts ?? {});
    setOpen(true);
  }, []);

  openPricingModalGlobal = openPricingModalFn;

  return (
    <PricingModalContext.Provider value={{ openPricingModal: openPricingModalFn }}>
      {children}
      <PricingModal
        open={open}
        onClose={() => setOpen(false)}
        title={options.title}
        subtitle={options.subtitle}
      />
    </PricingModalContext.Provider>
  );
}

export function usePricingModal() {
  const ctx = useContext(PricingModalContext);
  if (!ctx) {
    throw new Error('usePricingModal must be used within PricingModalProvider');
  }
  return ctx;
}
