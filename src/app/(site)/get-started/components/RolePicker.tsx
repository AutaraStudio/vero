'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import ActionButton from '@/components/ui/ActionButton';
import { useFadeUp } from '@/hooks/useFadeUp';
import { useBasket } from '@/store/basketStore';
import {
  TIER_DATA,
  getNudgeContent,
  getTierPrice,
  SELECTABLE_TIERS,
  recommendTier,
  isTierAtLeast,
  type TierKey,
} from '@/lib/tierRecommendation';
import BasketContent from './BasketContent';
import UpsellNudge from './UpsellNudge';

// ── Types ─────────────────────────────────────────────────────

interface Role {
  _id: string;
  name: string;
  slug: string;
  hubspotValue?: string;
  strengths?: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  roles: Role[];
}

interface RolePickerProps {
  categories: Category[];
}

// ── Category body (mounts on expand, animates cards in) ───────

interface CategoryBodyProps {
  roles: Role[];
  onToggle: (role: Role) => void;
  isSelected: (roleId: string) => boolean;
}

function CategoryBody({ roles, onToggle, isSelected }: CategoryBodyProps) {
  const bodyRef = useFadeUp({ selector: '[data-animate]', stagger: 0.04, delay: 0, y: 10, scroll: false });

  return (
    <div ref={bodyRef as React.RefObject<HTMLDivElement>} className="role-category__body">
      <div className="role-card-grid">
        {roles.map((role) => {
          const selected = isSelected(role._id);

          return (
            <div
              key={role._id}
              className={`role-card${selected ? ' is-selected' : ''}`}
              data-animate=""
            >
              <div className="role-card__info">
                <span className="text-body--sm font--medium color--primary">{role.name}</span>
                {role.strengths && (
                  <div className="role-card__tags">
                    {role.strengths.split(',').map((s) => {
                      const tag = s.trim();
                      const label = tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
                      return (
                        <span key={tag} className="pill">
                          {label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
              <ActionButton
                selected={selected}
                onClick={() => onToggle(role)}
                label={selected ? `Remove ${role.name}` : `Add ${role.name}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────

export default function RolePicker({ categories }: RolePickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, dispatch } = useBasket();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [nudgeVisible, setNudgeVisible] = useState(false);

  // Read ?tier= from URL (e.g. from pricing page) and set as override
  useEffect(() => {
    const tierParam = searchParams.get('tier') as TierKey | null;
    if (tierParam && SELECTABLE_TIERS.includes(tierParam)) {
      dispatch({ type: 'SET_TIER_OVERRIDE', payload: tierParam });
    }
  }, [searchParams, dispatch]);

  const { selectedRoles, recommendedTier, tierOverride, nudgeShown, paymentFrequency } = state;
  const tierInfo = recommendedTier ? TIER_DATA[recommendedTier] : null;
  const mobilePrice = tierInfo ? getTierPrice(tierInfo, paymentFrequency) : null;

  // The minimum tier required by the current role count
  const autoTier = selectedRoles.length > 0 ? recommendTier(selectedRoles.length) : null;

  const handleTierSelect = (tier: TierKey) => {
    if (tier === tierOverride) {
      // Deselect override — revert to auto
      dispatch({ type: 'SET_TIER_OVERRIDE', payload: null });
    } else {
      dispatch({ type: 'SET_TIER_OVERRIDE', payload: tier });
    }
  };

  const toggleCategory = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const isSelected = (roleId: string) => selectedRoles.some((r) => r.roleId === roleId);

  const handleToggleRole = (role: Role, category: Category) => {
    if (isSelected(role._id)) {
      dispatch({ type: 'REMOVE_ROLE', payload: { roleId: role._id } });
    } else {
      dispatch({
        type: 'ADD_ROLE',
        payload: {
          roleId: role._id,
          roleName: role.name,
          roleSlug: role.slug,
          roleHubspotValue: role.hubspotValue,
          categoryName: category.name,
          categorySlug: category.slug,
        },
      });
    }
  };

  // ── Select All / Clear All (Scale tier) ──

  const totalRoleCount = categories.reduce((sum, c) => sum + c.roles.length, 0);
  const allSelected = selectedRoles.length === totalRoleCount && totalRoleCount > 0;
  const isScaleTier = recommendedTier === 'scale';

  const handleSelectAll = () => {
    for (const category of categories) {
      for (const role of category.roles) {
        if (!isSelected(role._id)) {
          dispatch({
            type: 'ADD_ROLE',
            payload: {
              roleId: role._id,
              roleName: role.name,
              roleSlug: role.slug,
              roleHubspotValue: role.hubspotValue,
              categoryName: category.name,
              categorySlug: category.slug,
            },
          });
        }
      }
    }
  };

  const handleClearAll = () => {
    for (const role of selectedRoles) {
      dispatch({ type: 'REMOVE_ROLE', payload: { roleId: role.roleId } });
    }
  };

  const handleSelectCategory = (category: Category) => {
    for (const role of category.roles) {
      if (!isSelected(role._id)) {
        dispatch({
          type: 'ADD_ROLE',
          payload: {
            roleId: role._id,
            roleName: role.name,
            roleSlug: role.slug,
            roleHubspotValue: role.hubspotValue,
            categoryName: category.name,
            categorySlug: category.slug,
          },
        });
      }
    }
  };

  const handleDeselectCategory = (category: Category) => {
    for (const role of category.roles) {
      if (isSelected(role._id)) {
        dispatch({ type: 'REMOVE_ROLE', payload: { roleId: role._id } });
      }
    }
  };

  const handleContinue = () => {
    if (recommendedTier === 'bespoke') {
      router.push('/get-started/bespoke');
      return;
    }
    if (!nudgeShown && recommendedTier) {
      const content = getNudgeContent(recommendedTier, selectedRoles.length);
      if (content) {
        setNudgeVisible(true);
        return;
      }
    }
    router.push('/get-started/details');
  };

  return (
    <>
      <div className="role-picker">
        {/* ── Left: Basket ── */}
        <aside className="basket hide--mobile">
          <div className="basket__sticky">
            <BasketContent categories={categories} />
          </div>
        </aside>

        {/* ── Right: Role browser ── */}
        <div className="role-picker__browser">
          <div className="role-picker__header">
            <h1 className="text-h2 color--primary">Select your roles</h1>
            <p className="text-body--lg color--secondary leading--snug">
              Choose the roles you&apos;re hiring for. You can select as many as you need.
            </p>

            {/* Tier selector */}
            <div className="tier-selector">
              <span className="tier-selector__label text-label--sm color--tertiary">
                Choose your plan
              </span>
              <div className="tier-selector__options">
                {SELECTABLE_TIERS.map((tierKey) => {
                  const tier = TIER_DATA[tierKey];
                  const isActive = recommendedTier === tierKey;
                  const isBelowMinimum = autoTier ? !isTierAtLeast(tierKey, autoTier) : false;

                  return (
                    <button
                      key={tierKey}
                      className={`tier-selector__option${isActive ? ' is-active' : ''}${isBelowMinimum ? ' is-disabled' : ''}`}
                      disabled={isBelowMinimum}
                      onClick={() => handleTierSelect(tierKey)}
                      type="button"
                    >
                      <span className="tier-selector__option-name text-body--sm font--semibold">
                        {tier.name}
                      </span>
                      <span className="tier-selector__option-detail text-body--xs color--tertiary">
                        {tier.roleLimit}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scale tier — Select All banner */}
            {isScaleTier && (
              <div className="scale-select-banner">
                <div className="scale-select-banner__text">
                  <span className="text-body--sm font--medium color--primary">
                    {allSelected
                      ? `All ${totalRoleCount} roles selected`
                      : `Scale includes access to all ${totalRoleCount} roles`
                    }
                  </span>
                  <span className="text-body--xs color--tertiary">
                    {allSelected
                      ? 'You can deselect individual roles from the categories below'
                      : 'Select them all at once, or pick individually from the categories below'
                    }
                  </span>
                </div>
                <div className="scale-select-banner__actions">
                  {!allSelected && (
                    <button
                      type="button"
                      className="scale-select-banner__btn scale-select-banner__btn--primary"
                      onClick={handleSelectAll}
                    >
                      Select all roles
                    </button>
                  )}
                  {selectedRoles.length > 0 && (
                    <button
                      type="button"
                      className="scale-select-banner__btn scale-select-banner__btn--ghost"
                      onClick={handleClearAll}
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="role-picker__categories">
            {categories.map((category) => {
              const isExpanded = expanded.has(category._id);
              const selectedCount = selectedRoles.filter(
                (r) => r.categorySlug === category.slug
              ).length;

              return (
                <div
                  key={category._id}
                  className={`role-category${isExpanded ? ' is-expanded' : ''}`}
                >
                  <button
                    className="role-category__header"
                    onClick={() => toggleCategory(category._id)}
                    aria-expanded={isExpanded}
                  >
                    <div className="role-category__info">
                      <span className="text-h5 role-category__name color--primary">
                        {category.name}
                      </span>
                      <div className="role-category__meta">
                        <span className="role-category__count-badge text-label--sm color--tertiary">
                          {category.roles.length} roles
                        </span>
                        {selectedCount > 0 && (
                          <span className="role-category__selected-pill text-label--sm">
                            {selectedCount} selected
                          </span>
                        )}
                        {isScaleTier && (
                          <button
                            type="button"
                            className="role-category__select-all text-label--sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (selectedCount === category.roles.length) {
                                handleDeselectCategory(category);
                              } else {
                                handleSelectCategory(category);
                              }
                            }}
                          >
                            {selectedCount === category.roles.length ? 'Deselect all' : 'Select all'}
                          </button>
                        )}
                      </div>
                    </div>
                    <span className="role-category__chevron" aria-hidden="true" />
                  </button>

                  {isExpanded && (
                    <CategoryBody
                      roles={category.roles}
                      onToggle={(role) => handleToggleRole(role, category)}
                      isSelected={isSelected}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Mobile: sticky bottom bar ── */}
        <div className="basket-mobile-bar show--mobile-only">
          <div className="basket-mobile-bar__inner">
            <div className="basket-mobile-bar__info">
              <div className="basket-mobile-bar__info-row">
                <span className="text-body--sm font--medium color--primary">
                  {selectedRoles.length} role{selectedRoles.length !== 1 ? 's' : ''}
                </span>
                {tierInfo && (
                  <span className="section-label">{tierInfo.name}</span>
                )}
              </div>
              {tierInfo && mobilePrice && (
                <span className="text-body--xs color--tertiary">
                  {mobilePrice.price} · {mobilePrice.priceNote}
                </span>
              )}
            </div>
            <div className="basket-mobile-bar__actions">
              <button
                className="basket-mobile-bar__view"
                onClick={() => setDrawerOpen(true)}
              >
                View basket
              </button>
              <Button
                variant="primary"
                size="sm"
                onClick={selectedRoles.length > 0 ? handleContinue : undefined}
                disabled={selectedRoles.length === 0}
              >
                {recommendedTier === 'bespoke' ? 'Discuss requirements →' : 'Continue →'}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Mobile: basket drawer ── */}
        {drawerOpen && (
          <div
            className="basket-drawer show--mobile-only"
            role="dialog"
            aria-modal="true"
            aria-label="Your basket"
          >
            <div
              className="basket-drawer__backdrop"
              onClick={() => setDrawerOpen(false)}
            />
            <div className="basket-drawer__panel">
              <button
                className="basket-drawer__close"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close basket"
              >
                ×
              </button>
              <BasketContent categories={categories} />
            </div>
          </div>
        )}
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
