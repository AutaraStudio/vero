'use client';

import { createContext, useCallback, useContext, useState } from 'react';

interface TransitionContextValue {
  isTransitioning: boolean;
  nextTitle: string;
  pendingHref: string | null;
  triggerLeave: (href: string, title: string) => void;
  onLeaveComplete: () => void;
}

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextTitle, setNextTitle] = useState('');
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const triggerLeave = useCallback((href: string, title: string) => {
    if (isTransitioning) return;
    document.dispatchEvent(new CustomEvent('nav:close'));
    setPendingHref(href);
    setNextTitle(title);
    setTimeout(() => {
      setIsTransitioning(true);
    }, 250);
  }, [isTransitioning]);

  const onLeaveComplete = useCallback(() => {
    setIsTransitioning(false);
    setPendingHref(null);
  }, []);

  return (
    <TransitionContext.Provider value={{ isTransitioning, nextTitle, pendingHref, triggerLeave, onLeaveComplete }}>
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error('useTransition must be used within a TransitionProvider');
  return ctx;
}
