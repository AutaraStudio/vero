'use client';

import { useEffect, useSyncExternalStore } from 'react';

/**
 * Tiny module-level signal that lets a page (e.g. /get-started/details)
 * tell PlanBar whether its primary CTA should be disabled. PlanBar is a
 * sibling of the page content via GetStartedShell, so prop-drilling
 * isn't possible — and a full Context would mean wrapping the shell in
 * a client provider just for one boolean. This pattern keeps the layout
 * a server component while still being reactive.
 *
 * The signal is reset to `false` on unmount so leaving the page never
 * leaves PlanBar stuck in a disabled state.
 */

let disabled = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return disabled;
}

/* SSR: render the bar as enabled. The page hasn't mounted yet so the
   signal would otherwise resolve to whatever the previous client state
   was, which on first paint is meaningless. */
function getServerSnapshot() {
  return false;
}

export function usePlanBarSubmitDisabled(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Page hook — call from a form page to publish its disabled state to
 * PlanBar. Resets to false on unmount.
 */
export function usePublishPlanBarSubmitDisabled(value: boolean): void {
  useEffect(() => {
    disabled = value;
    emit();
    return () => {
      disabled = false;
      emit();
    };
  }, [value]);
}
