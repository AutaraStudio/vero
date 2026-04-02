'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { useFadeUp } from '@/hooks/useFadeUp';
import { useBasket } from '@/store/basketStore';
import { TIER_DATA, getNudgeContent } from '@/lib/tierRecommendation';
import BasketContent from './BasketContent';
import UpsellNudge from './UpsellNudge';

// ── Types ─────────────────────────────────────────────────────

interface Role {
  _id: string;
  name: string;
  slug: string;
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
                        <span key={tag} className="role-tag">
                          {label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
              <button
                className="role-card__action"
                onClick={() => onToggle(role)}
                aria-pressed={selected}
                aria-label={selected ? `Remove ${role.name}` : `Add ${role.name}`}
              >
                <span aria-hidden="true">{selected ? '−' : '+'}</span>
              </button>
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
  const { state, dispatch } = useBasket();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [nudgeVisible, setNudgeVisible] = useState(false);

  const { selectedRoles, recommendedTier, nudgeShown } = state;
  const tierInfo = recommendedTier ? TIER_DATA[recommendedTier] : null;

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
          categoryName: category.name,
          categorySlug: category.slug,
        },
      });
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
              <span className="text-body--sm font--medium color--primary">
                {selectedRoles.length} role{selectedRoles.length !== 1 ? 's' : ''} selected
              </span>
              {tierInfo && (
                <span className="section-label">{tierInfo.name}</span>
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
