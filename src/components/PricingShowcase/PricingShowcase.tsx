import { client } from '@/sanity/lib/client';
import { PRICING_PAGE_QUERY, PRICING_TIERS_QUERY } from '@/sanity/lib/queries';
import TierCardsSection from '@/app/(site)/pricing/TierCardsSection';
import ComparisonTable from '@/app/(site)/pricing/ComparisonTable';
import type { PricingTier, PricingPageContent } from '@/app/(site)/pricing/page';
import PricingShowcaseHeader from './PricingShowcaseHeader';
import '@/app/(site)/pricing/pricing.css';
import './PricingShowcase.css';

interface Props {
  /** When true, the comparison table starts collapsed with an expand button. */
  collapsible?: boolean;
  /** When true, render the heading block above the cards.
   *  Defaults to the same value as `collapsible` — assessment pages need a
   *  heading; /pricing has its own hero so it opts out. */
  withHeader?: boolean;
  /** Override the heading text (defaults below). */
  heading?: string;
  /** Override the intro text. */
  intro?: string;
}

/**
 * Reusable pricing block — tier cards + feature comparison.
 * Used on /pricing (open) and on assessment pages (collapsible + with header).
 */
export default async function PricingShowcase({
  collapsible = false,
  withHeader,
  heading = 'Plans for every team size',
  intro = "Whether you're hiring for one role or scaling to fifty, there's a plan that fits. Every plan includes our science-backed assessments.",
}: Props) {
  const [page, tiers] = await Promise.all([
    client.fetch<PricingPageContent | null>(PRICING_PAGE_QUERY),
    client.fetch<PricingTier[]>(PRICING_TIERS_QUERY),
  ]);

  if (!tiers || tiers.length === 0) return null;

  const showHeader = withHeader ?? collapsible;

  return (
    <>
      {showHeader && (
        <PricingShowcaseHeader
          label="Pricing"
          heading={heading}
          intro={intro}
        />
      )}
      <TierCardsSection
        tiers={tiers}
        starterCallout={page?.starterCallout}
        theme="brand-purple"
      />
      <ComparisonTable
        tiers={tiers}
        theme="brand-purple"
        collapsible={collapsible}
      />
    </>
  );
}
