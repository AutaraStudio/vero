'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { useFadeUp } from '@/hooks/useFadeUp';
import { useBasket } from '@/store/basketStore';
import { TIER_DATA } from '@/lib/tierRecommendation';

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

// ── Category body (mounts on expand, animates rows in) ────────

interface CategoryBodyProps {
  roles: Role[];
  onToggle: (role: Role) => void;
  isSelected: (roleId: string) => boolean;
}

function CategoryBody({ roles, onToggle, isSelected }: CategoryBodyProps) {
  const bodyRef = useFadeUp({ selector: '[data-animate]', stagger: 0.04, delay: 0, y: 10 });

  return (
    <div ref={bodyRef as React.RefObject<HTMLDivElement>} className="role-category__body">
      {roles.map((role) => {
        const selected = isSelected(role._id);
        return (
          <div
            key={role._id}
            className={`role-row${selected ? ' is-selected' : ''}`}
            data-animate=""
          >
            <div className="role-row__info">
              <span className="text-body--sm font--medium color--primary">{role.name}</span>
              {role.strengths && (
                <span className="text-body--xs color--tertiary">{role.strengths}</span>
              )}
            </div>
            <button
              className={`role-row__toggle${selected ? ' is-selected' : ''}`}
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
  );
}

// ── Main component ────────────────────────────────────────────

export default function RolePicker({ categories }: RolePickerProps) {
  const { state, dispatch } = useBasket();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { selectedRoles, recommendedTier } = state;
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

  // Grouped view for basket
  const groupedByCategory = categories.filter((cat) =>
    selectedRoles.some((r) => r.categorySlug === cat.slug)
  );

  const BasketContent = () => (
    <>
      <h2 className="text-h5 color--primary basket__title">Your basket</h2>

      {selectedRoles.length === 0 ? (
        <p className="text-body--sm basket__empty">No roles selected yet.</p>
      ) : (
        <div className="basket__roles">
          {groupedByCategory.map((cat) => {
            const catRoles = selectedRoles.filter((r) => r.categorySlug === cat.slug);
            return (
              <div key={cat._id} className="basket__category-group">
                <span className="text-label--sm color--tertiary">{cat.name}</span>
                {catRoles.map((role) => (
                  <div key={role.roleId} className="basket__role-row">
                    <span className="text-body--sm font--medium color--primary">{role.roleName}</span>
                    <button
                      className="basket__remove"
                      onClick={() => dispatch({ type: 'REMOVE_ROLE', payload: { roleId: role.roleId } })}
                      aria-label={`Remove ${role.roleName}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      <div className="basket__tier">
        <span className="text-label--sm color--tertiary">Recommended plan:</span>
        {tierInfo ? (
          <div className="basket__tier-detail">
            <span className="section-label">{tierInfo.name}</span>
            <div className="basket__tier-meta">
              <span className="text-body--sm font--medium color--primary">{tierInfo.price}</span>
              <span className="text-body--xs color--tertiary">{tierInfo.candidateLimit}</span>
              <span className="text-body--xs color--tertiary">{tierInfo.roleLimit}</span>
            </div>
          </div>
        ) : (
          <span className="text-body--sm color--tertiary">—</span>
        )}
      </div>

      <div className="basket__cta">
        <Button
          variant="primary"
          size="md"
          href={selectedRoles.length > 0 ? '/get-started/details' : undefined}
          disabled={selectedRoles.length === 0}
        >
          {selectedRoles.length > 0
            ? `Continue to details (${selectedRoles.length}) →`
            : 'Continue to details →'}
        </Button>
      </div>
    </>
  );

  return (
    <div className="role-picker">
      {/* ── Left: Basket ── */}
      <aside className="basket hide--mobile">
        <div className="basket__sticky">
          <BasketContent />
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
            const selectedCount = selectedRoles.filter((r) => r.categorySlug === category.slug).length;

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
                    <span className="text-h5 role-category__name">{category.name}</span>
                    <div className="role-category__meta">
                      <span className="text-label--sm color--tertiary">
                        {category.roles.length} roles
                      </span>
                      {selectedCount > 0 && (
                        <span className="section-label role-category__selected-count">
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
              href={selectedRoles.length > 0 ? '/get-started/details' : undefined}
              disabled={selectedRoles.length === 0}
            >
              Continue →
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
            <BasketContent />
          </div>
        </div>
      )}
    </div>
  );
}
