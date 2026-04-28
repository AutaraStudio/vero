'use client';

import { useBasket } from '@/store/basketStore';
import { TIER_DATA, type TierKey } from '@/lib/tierRecommendation';
import type { PricingTier } from './page';

interface Props {
  className?: string;
}

/**
 * Annual / Monthly billing toggle.
 * Updates basket store's paymentFrequency, which:
 *   1. Drives prices shown across TierCardsSection + ComparisonTable
 *   2. Persists in sessionStorage and carries through to /payment
 */
export default function BillingToggle({ className = '' }: Props) {
  const { state, dispatch } = useBasket();
  const isAnnual = state.paymentFrequency === 'annual';

  return (
    <div className={`billing-toggle ${className}`.trim()} role="group" aria-label="Billing frequency">
      <button
        type="button"
        className={`billing-toggle__option${!isAnnual ? ' is-active' : ''}`}
        onClick={() => dispatch({ type: 'SET_PAYMENT_FREQUENCY', payload: 'monthly' })}
        aria-pressed={!isAnnual}
      >
        Monthly
      </button>
      <button
        type="button"
        className={`billing-toggle__option${isAnnual ? ' is-active' : ''}`}
        onClick={() => dispatch({ type: 'SET_PAYMENT_FREQUENCY', payload: 'annual' })}
        aria-pressed={isAnnual}
      >
        Annual
      </button>
    </div>
  );
}

// ── Shared helper used by both card section and comparison table ─

export interface DisplayedPrice {
  display: string | null;
  note: string | null;
  /** Inline price suffix shown next to the value, e.g. "/mo" or "/yr". Null for one-off tiers. */
  suffix: string | null;
  /** True if this tier doesn't support the requested frequency (e.g. Starter on Monthly) */
  isFallbackToAnnual: boolean;
}

/**
 * Resolve the price + note + suffix to render for a tier given the chosen frequency.
 * Prefers Sanity-authored values; falls back to the hardcoded TIER_DATA monthly
 * values until the schema is deployed and content team populates the new fields.
 *
 * Starter (and any tier without a monthly price) always shows its annual/one-off price
 * with no /mo or /yr suffix — Monthly is conceptually N/A.
 */
export function getDisplayedPrice(
  tier: PricingTier,
  frequency: 'annual' | 'monthly',
): DisplayedPrice {
  const fallback = TIER_DATA[tier.slug as TierKey];
  // A tier is "recurring" if there's a monthly price somewhere — Sanity or TIER_DATA fallback.
  // Tiers without monthly options are one-off (e.g. Starter) and get no /yr or /mo suffix.
  const isRecurring = !!(tier.monthlyPriceDisplay ?? fallback?.monthlyPrice);

  if (frequency === 'annual') {
    return {
      display: tier.priceDisplay ?? null,
      note: tier.paymentOptions ?? null,
      suffix: isRecurring ? '/yr' : null,
      isFallbackToAnnual: false,
    };
  }

  // Monthly path — Sanity fields first, then TIER_DATA fallback
  const sanityMonthly = tier.monthlyPriceDisplay;
  const sanityMonthlyNote = tier.monthlyPriceNote;
  const fallbackMonthly = fallback?.monthlyPrice ?? null;
  const fallbackMonthlyNote = fallback?.monthlyPriceNote ?? null;

  const monthlyDisplay = sanityMonthly ?? fallbackMonthly;
  const monthlyNote = sanityMonthlyNote ?? fallbackMonthlyNote;

  if (monthlyDisplay) {
    return {
      display: monthlyDisplay,
      note: monthlyNote,
      suffix: '/mo',
      isFallbackToAnnual: false,
    };
  }

  // No monthly available (e.g. Starter) — show annual price as-is, no suffix
  return {
    display: tier.priceDisplay ?? null,
    note: tier.paymentOptions ?? null,
    suffix: null,
    isFallbackToAnnual: true,
  };
}
