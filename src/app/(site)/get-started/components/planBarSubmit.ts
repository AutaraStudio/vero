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
let pendingLabel: string | null = null;
let actionHandler: (() => void) | null = null;
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

function getDisabledSnapshot() {
  return disabled;
}
function getActionSnapshot() {
  return actionHandler;
}
function getLabelSnapshot() {
  return pendingLabel;
}

/* SSR fallbacks — match initial-client state. */
function getDisabledServerSnapshot() {
  return false;
}
function getActionServerSnapshot(): (() => void) | null {
  return null;
}
function getLabelServerSnapshot(): string | null {
  return null;
}

export function usePlanBarSubmitDisabled(): boolean {
  return useSyncExternalStore(subscribe, getDisabledSnapshot, getDisabledServerSnapshot);
}

/**
 * PlanBar reads this — when a page publishes an action, the bar's CTA
 * runs it instead of doing its default navigation. Lets pages like
 * /payment intercept the Continue click to submit a Stripe form or
 * trigger an invoice handler.
 */
export function usePlanBarSubmitAction(): (() => void) | null {
  return useSyncExternalStore(subscribe, getActionSnapshot, getActionServerSnapshot);
}

/** PlanBar reads this to override its CTA label when the page wants. */
export function usePlanBarSubmitLabel(): string | null {
  return useSyncExternalStore(subscribe, getLabelSnapshot, getLabelServerSnapshot);
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

/**
 * Page hook — publish a click handler that PlanBar should run when its
 * CTA is pressed. Pair with `usePublishPlanBarSubmitLabel` to set the
 * CTA's label (e.g. "Processing…" while submitting).
 */
export function usePublishPlanBarSubmitAction(handler: (() => void) | null): void {
  useEffect(() => {
    actionHandler = handler;
    emit();
    return () => {
      actionHandler = null;
      emit();
    };
  }, [handler]);
}

/** Page hook — override PlanBar's CTA label for this page. */
export function usePublishPlanBarSubmitLabel(label: string | null): void {
  useEffect(() => {
    pendingLabel = label;
    emit();
    return () => {
      pendingLabel = null;
      emit();
    };
  }, [label]);
}
