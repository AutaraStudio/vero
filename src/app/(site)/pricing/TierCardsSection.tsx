'use client';

import Button from '@/components/ui/Button';
import SharedCheckIcon from '@/components/ui/CheckIcon';
import { Tooltip, TooltipContent } from '@/components/Tooltip/Tooltip';
import { useFadeUp } from '@/hooks/useFadeUp';
import { useBasket } from '@/store/basketStore';
import type { ThemeVariant } from '@/lib/theme';
import type { PricingTier } from './page';
import BillingToggle, { getDisplayedPrice } from './BillingToggle';

interface Props {
  tiers: PricingTier[];
  starterCallout?: string;
  theme?: ThemeVariant;
}

function tierHref(tier: PricingTier): string {
  if (tier.ctaType === 'contact') return '/contact';
  /* Defensive: if slug is somehow missing from Sanity, route to the bare
     get-started page rather than rendering /get-started?tier=undefined,
     which previously could send a click home if the URL parsed oddly. */
  return tier.slug ? `/get-started?tier=${tier.slug}` : '/get-started';
}

/**
 * Pricing tier cards — grid of self-contained per-tier cards.
 *
 * Each card stacks vertically: name → tagline → price → feature highlights
 * → CTA. The grid is 4-col on desktop, 2-col on tablet, 1-col on mobile.
 * Per-card structure (vs the old "single table grid" approach) ensures
 * the layout works at every breakpoint — cells can never end up in a
 * grid column that doesn't exist.
 */
export default function TierCardsSection({
  tiers,
  starterCallout,
  theme = 'brand-purple',
}: Props) {
  const { state } = useBasket();
  const frequency = state.paymentFrequency;
  const cardsRef   = useFadeUp({ selector: '.pricing-tier-card', stagger: 0.08, y: 24 });

  return (
    <section id="pricing-tiers" data-theme={theme} className="pricing-tiers-section section">
      <div className="container">

        <div className="pricing-tiers-toolbar">
          <BillingToggle />
          <span className="billing-toggle__hint text-body--xs font--medium">
            <span className="billing-toggle__hint-icon" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z"
                  fill="currentColor"
                />
              </svg>
            </span>
            Save 10% with annual billing
          </span>
        </div>

        <div ref={cardsRef as React.RefObject<HTMLDivElement>} className="pricing-tiers-grid">
          {tiers.map((tier, ti) => {
            const showTooltip = tier.slug === 'starter' && !!starterCallout;
            const previousTier = ti > 0 ? tiers[ti - 1] : null;
            const { display, suffix } = getDisplayedPrice(tier, frequency);

            return (
              <article
                key={tier._id}
                className={`pricing-tier-card${tier.isFeatured ? ' pricing-tier-card--featured' : ''}`}
              >
                {/* ── Name bar ── */}
                <div
                  data-theme="brand-purple-deep"
                  className="pricing-tier-card__name-bar"
                >
                  <span className="pricing-tier-cell__name-inner">
                    <span className="text-h3 color--primary">{tier.name}</span>
                    {showTooltip && (
                      <span className="pricing-tier-cell__name-tooltip">
                        <Tooltip
                          y="bottom"
                          content={<TooltipContent body={starterCallout!} />}
                        >
                          {''}
                        </Tooltip>
                      </span>
                    )}
                  </span>
                </div>

                {/* ── Body: tagline → price → features → CTA ── */}
                <div className="pricing-tier-card__body">
                  {tier.tagline && (
                    <p className="pricing-tier-card__tagline text-body--sm color--secondary leading--snug">
                      {tier.tagline}
                    </p>
                  )}

                  {display && (
                    <div className="pricing-tier-card__price">
                      <span className="pricing-tier-card__price-row">
                        <span className="pricing-tier-card__price-value text-h2 color--primary">
                          {display}
                        </span>
                        {suffix && (
                          <span className="pricing-tier-card__price-suffix text-body--md color--tertiary">
                            {suffix}
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  <div className="pricing-tier-card__features">
                    {previousTier && (
                      <p className="pricing-tier-card__includes text-body--sm color--secondary">
                        <span className="pricing-tier-card__includes-arrow" aria-hidden="true">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M5 12h14M13 6l6 6-6 6"
                              stroke="currentColor"
                              strokeWidth="1.75"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        <span>
                          Everything in <strong className="color--primary">{previousTier.name}</strong>, plus:
                        </span>
                      </p>
                    )}

                    <ul className="pricing-tier-card__highlights">
                      {tier.candidateLimit !== undefined && tier.candidateLimit !== null && (
                        <li className="pricing-tier-card__highlight text-body--sm color--secondary">
                          <CheckIcon />
                          Up to {tier.candidateLimit.toLocaleString()} candidates
                        </li>
                      )}
                      {tier.roleLimit !== undefined && tier.roleLimit !== null && (
                        <li className="pricing-tier-card__highlight text-body--sm color--secondary">
                          <CheckIcon />
                          {tier.roleLimit === 1
                            ? '1 job role'
                            : tier.name === 'Scale'
                              ? `Access to all ${tier.roleLimit} roles`
                              : `Up to ${tier.roleLimit} job roles`}
                        </li>
                      )}
                      {tier.duration && (
                        <li className="pricing-tier-card__highlight text-body--sm color--secondary">
                          <CheckIcon />
                          {tier.duration}
                        </li>
                      )}
                    </ul>

                    {tier.upgradeNote && (
                      <p className="pricing-tier-card__note text-body--xs color--tertiary">
                        {tier.upgradeNote}
                      </p>
                    )}
                  </div>

                  <div className="pricing-tier-card__cta">
                    <Button
                      variant={tier.isFeatured ? 'cta' : 'primary'}
                      size="md"
                      href={tierHref(tier)}
                    >
                      Get started
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <span className="pricing-check-icon" aria-hidden="true">
      <SharedCheckIcon size={14} />
    </span>
  );
}
