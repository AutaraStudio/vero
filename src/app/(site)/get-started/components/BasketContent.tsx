'use client';

import { useState, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useBasket } from '@/store/basketStore';
import { TIER_DATA, getTierPrice } from '@/lib/tierRecommendation';

interface CategorySummary {
  _id: string;
  name: string;
  slug: string;
}

interface BasketContentProps {
  /** Sanity-fetched categories for ordering. In `review` mode the component
   *  derives this list from the basket itself if not supplied. */
  categories?: CategorySummary[];
  /**
   * - `edit`    (role picker) — remove buttons, frequency toggle visible
   * - `review`  (checkout steps) — read-only chips, frequency shown as
   *             plain label
   *
   * Both modes are now read-only at the bottom; the navigation CTA lives
   * in the sticky PlanBar at the bottom of the viewport instead.
   */
  mode?: 'edit' | 'review';
}

const COLLAPSE_THRESHOLD = 3;
const VISIBLE_COUNT = 2;

export default function BasketContent({ categories, mode = 'edit' }: BasketContentProps) {
  const { state, dispatch } = useBasket();
  const { selectedRoles, recommendedTier, paymentFrequency } = state;
  const tierInfo = recommendedTier ? TIER_DATA[recommendedTier] : null;

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const hasAnimatedRef = useRef<Set<string>>(new Set());

  /* In edit mode, we use the Sanity-supplied category order. In review mode
     no categories prop is given, so derive a unique list from the basket in
     selection order. */
  const groupedByCategory: CategorySummary[] = categories
    ? categories.filter((cat) => selectedRoles.some((r) => r.categorySlug === cat.slug))
    : (() => {
        const seen = new Set<string>();
        const out: CategorySummary[] = [];
        for (const r of selectedRoles) {
          if (seen.has(r.categorySlug)) continue;
          seen.add(r.categorySlug);
          out.push({ _id: r.categorySlug, name: r.categoryName, slug: r.categorySlug });
        }
        return out;
      })();

  const isReview = mode === 'review';

  const makeHiddenRolesRef = (slug: string) => (el: HTMLDivElement | null) => {
    if (!el || hasAnimatedRef.current.has(slug)) return;
    hasAnimatedRef.current.add(slug);
    const items = el.querySelectorAll('.basket__role-chip');
    if (items.length === 0) return;
    gsap.from(items, {
      height: 0,
      opacity: 0,
      stagger: 0.04,
      duration: 0.25,
      ease: 'power2.out',
      clearProps: 'height,opacity',
    });
  };

  const expandCategory = (slug: string) => {
    setExpandedCategories((prev) => new Set([...prev, slug]));
  };

  const collapseCategory = (slug: string) => {
    hasAnimatedRef.current.delete(slug);
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.delete(slug);
      return next;
    });
  };

  const { price, priceNote } = tierInfo
    ? getTierPrice(tierInfo, paymentFrequency)
    : { price: '', priceNote: '' };

  return (
    <>
      <h2 className="text-h5 color--primary basket__title">Your basket</h2>

      {/* Scrollable middle region — only this part scrolls when there are
          many roles. Title (above) + footer (below) stay pinned. */}
      <div className="basket__scroll">
      {selectedRoles.length === 0 ? (
        <p className="text-body--sm basket__empty">No roles selected yet.</p>
      ) : (
        <div className="basket__roles">
          {groupedByCategory.map((cat, catIdx) => {
            const catRoles = selectedRoles.filter((r) => r.categorySlug === cat.slug);
            const needsCollapse = catRoles.length > COLLAPSE_THRESHOLD;
            const isExpanded = expandedCategories.has(cat.slug);
            const visibleRoles = needsCollapse ? catRoles.slice(0, VISIBLE_COUNT) : catRoles;
            const hiddenCount = catRoles.length - VISIBLE_COUNT;

            return (
              <div
                key={cat._id}
                className={`basket__category-group${catIdx > 0 ? ' basket__category-group--spaced' : ''}`}
              >
                <span className="text-label--sm color--tertiary">{cat.name}</span>

                {visibleRoles.map((role) => (
                  <div key={role.roleId} className="basket__role-chip">
                    <span className="text-body--sm font--medium color--primary basket__role-chip__name">
                      {role.roleName}
                    </span>
                    {!isReview && (
                      <button
                        className="basket__remove"
                        onClick={() =>
                          dispatch({ type: 'REMOVE_ROLE', payload: { roleId: role.roleId } })
                        }
                        aria-label={`Remove ${role.roleName}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}

                {needsCollapse && !isExpanded && (
                  <button
                    className="basket__expand-toggle text-label--sm color--tertiary"
                    onClick={() => expandCategory(cat.slug)}
                  >
                    +{hiddenCount} more
                  </button>
                )}

                {needsCollapse && isExpanded && (
                  <>
                    <div
                      className="basket__hidden-roles"
                      ref={makeHiddenRolesRef(cat.slug)}
                    >
                      {catRoles.slice(VISIBLE_COUNT).map((role) => (
                        <div key={role.roleId} className="basket__role-chip">
                          <span className="text-body--sm font--medium color--primary basket__role-chip__name">
                            {role.roleName}
                          </span>
                          <button
                            className="basket__remove"
                            onClick={() =>
                              dispatch({ type: 'REMOVE_ROLE', payload: { roleId: role.roleId } })
                            }
                            aria-label={`Remove ${role.roleName}`}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      className="basket__expand-toggle text-label--sm color--tertiary"
                      onClick={() => collapseCategory(cat.slug)}
                    >
                      Show less
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Footer — always visible at the bottom of the sidebar. Holds the
          tier panel + the page's primary action (in review mode) or the
          basket's own Continue CTA (in edit mode). */}
      <div className="basket__footer">
      <div className="basket__tier">
        {tierInfo ? (
          <>

            {/* Tier name — plain, no badge */}
            <div className="basket__tier-name-row">
              <span className="basket__tier-name">{tierInfo.name}</span>
            </div>

            {/* Frequency toggle — interactive on every checkout step so
                buyers can switch annual / monthly right up to payment. */}
            {tierInfo.hasFrequencyToggle && (
              <div className="basket__tier-freq-row">
                <div className="basket__freq-toggle">
                  <button
                    className={`basket__freq-btn${paymentFrequency === 'annual' ? ' is-active' : ''}`}
                    onClick={() => dispatch({ type: 'SET_PAYMENT_FREQUENCY', payload: 'annual' })}
                    type="button"
                  >
                    Annual
                  </button>
                  <button
                    className={`basket__freq-btn${paymentFrequency === 'monthly' ? ' is-active' : ''}`}
                    onClick={() => dispatch({ type: 'SET_PAYMENT_FREQUENCY', payload: 'monthly' })}
                    type="button"
                  >
                    Monthly
                  </button>
                </div>
              </div>
            )}

            {/* Price + limits */}
            <div className="basket__tier-pricing-row">
              <span className="basket__tier-price">{price}</span>
              <div className="basket__tier-meta">
                <span className="text-body--xs color--tertiary">{priceNote}</span>
                <span className="text-body--xs color--tertiary">{tierInfo.candidateLimit}</span>
                <span className="text-body--xs color--tertiary">{tierInfo.roleLimit}</span>
              </div>
            </div>

          </>
        ) : (
          <span className="text-body--sm color--tertiary">—</span>
        )}
      </div>

      {/* The Continue CTA has moved out of the sidebar and into the
          sticky PlanBar so the same controls drive the user from /get-started
          through to /payment. Sidebar is now read-only summary. */}
      </div>
    </>
  );
}
