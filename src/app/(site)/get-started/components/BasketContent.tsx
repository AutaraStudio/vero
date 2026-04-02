'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { gsap } from '@/lib/gsap';
import { useBasket } from '@/store/basketStore';
import { TIER_DATA, getTierPrice, getNudgeContent } from '@/lib/tierRecommendation';
import UpsellNudge from './UpsellNudge';

interface CategorySummary {
  _id: string;
  name: string;
  slug: string;
}

interface BasketContentProps {
  categories: CategorySummary[];
}

const COLLAPSE_THRESHOLD = 3;
const VISIBLE_COUNT = 2;

export default function BasketContent({ categories }: BasketContentProps) {
  const router = useRouter();
  const { state, dispatch } = useBasket();
  const { selectedRoles, recommendedTier, paymentFrequency, nudgeShown } = state;
  const tierInfo = recommendedTier ? TIER_DATA[recommendedTier] : null;

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [nudgeVisible, setNudgeVisible] = useState(false);
  const hasAnimatedRef = useRef<Set<string>>(new Set());

  const groupedByCategory = categories.filter((cat) =>
    selectedRoles.some((r) => r.categorySlug === cat.slug)
  );

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

  const handleContinue = () => {
    if (recommendedTier === 'bespoke') {
      router.push('/get-started/bespoke');
      return;
    }
    if (!nudgeShown && recommendedTier) {
      const nudgeContent = getNudgeContent(recommendedTier, selectedRoles.length);
      if (nudgeContent) {
        setNudgeVisible(true);
        return;
      }
    }
    router.push('/get-started/details');
  };

  const { price, priceNote } = tierInfo
    ? getTierPrice(tierInfo, paymentFrequency)
    : { price: '', priceNote: '' };

  return (
    <>
      <h2 className="text-h5 color--primary basket__title">Your basket</h2>

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

      <div className="basket__tier">
        <span className="text-label--sm color--tertiary">Recommended plan:</span>
        {tierInfo ? (
          recommendedTier === 'bespoke' ? (
            <div className="basket__tier-detail">
              <span className="section-label">Bespoke</span>
              <div className="basket__tier-meta">
                <span className="text-body--sm color--secondary">
                  Tailored pricing
                </span>
                <span className="text-body--xs color--tertiary">
                  Our team will build a custom solution for your organisation.
                </span>
              </div>
            </div>
          ) : (
            <div className="basket__tier-detail">
              <span className="section-label">{tierInfo.name}</span>

              {tierInfo.hasFrequencyToggle && (
                <div className="basket__frequency-toggle">
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
              )}

              <div className="basket__tier-meta">
                <span className="text-h5 color--primary">{price}</span>
                <span className="text-body--xs color--tertiary">{priceNote}</span>
                <span className="text-body--xs color--tertiary">{tierInfo.candidateLimit}</span>
                <span className="text-body--xs color--tertiary">{tierInfo.roleLimit}</span>
              </div>
            </div>
          )
        ) : (
          <span className="text-body--sm color--tertiary">—</span>
        )}
      </div>

      <div className="basket__cta">
        <Button
          variant="primary"
          size="md"
          onClick={selectedRoles.length > 0 ? handleContinue : undefined}
          disabled={selectedRoles.length === 0}
        >
          {recommendedTier === 'bespoke'
            ? 'Discuss your requirements →'
            : selectedRoles.length > 0
              ? `Continue to details (${selectedRoles.length}) →`
              : 'Continue to details →'}
        </Button>
      </div>

      {nudgeVisible && recommendedTier && (() => {
        const content = getNudgeContent(recommendedTier, selectedRoles.length);
        if (!content) return null;
        return (
          <UpsellNudge
            content={content}
            onAddMore={() => {
              dispatch({ type: 'SET_NUDGE_SHOWN' });
              setNudgeVisible(false);
            }}
            onContinue={() => {
              dispatch({ type: 'SET_NUDGE_SHOWN' });
              setNudgeVisible(false);
              router.push('/get-started/details');
            }}
          />
        );
      })()}
    </>
  );
}
