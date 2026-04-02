'use client';

import { useState, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useBasket } from '@/store/basketStore';

interface OrderSummaryProps {
  showContact?: boolean;
}

const COLLAPSE_THRESHOLD = 3;
const VISIBLE_COUNT = 2;

export default function OrderSummary({ showContact = false }: OrderSummaryProps) {
  const { state } = useBasket();
  const { selectedRoles, contactDetails } = state;

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const hasAnimatedRef = useRef<Set<string>>(new Set());

  const rolesByCategory = selectedRoles.reduce<
    Record<string, { slug: string; name: string; roles: string[] }>
  >((acc, role) => {
    if (!acc[role.categorySlug]) {
      acc[role.categorySlug] = { slug: role.categorySlug, name: role.categoryName, roles: [] };
    }
    acc[role.categorySlug].roles.push(role.roleName);
    return acc;
  }, {});

  const makeHiddenRolesRef = (slug: string) => (el: HTMLDivElement | null) => {
    if (!el || hasAnimatedRef.current.has(slug)) return;
    hasAnimatedRef.current.add(slug);
    const items = el.querySelectorAll('.order-summary__role-chip');
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

  const collapseCategory = (slug: string) => {
    hasAnimatedRef.current.delete(slug);
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.delete(slug);
      return next;
    });
  };

  const inner = (
    <div className="order-summary__inner">
      <h3 className="text-h5 color--primary">Order summary</h3>

      {/* Roles */}
      {selectedRoles.length === 0 ? (
        <p className="text-body--sm color--tertiary">No roles selected.</p>
      ) : (
        <div className="order-summary__roles">
          {Object.values(rolesByCategory).map(({ slug, name, roles }) => {
            const needsCollapse = roles.length > COLLAPSE_THRESHOLD;
            const isExpanded = expandedCategories.has(slug);
            const visibleRoles = needsCollapse ? roles.slice(0, VISIBLE_COUNT) : roles;
            const hiddenCount = roles.length - VISIBLE_COUNT;

            return (
              <div key={slug} className="order-summary__category-group">
                <span className="text-label--sm color--tertiary order-summary__cat-label">
                  {name}
                </span>

                {visibleRoles.map((r) => (
                  <div key={r} className="order-summary__role-chip">
                    <span className="text-body--xs font--medium color--primary">{r}</span>
                  </div>
                ))}

                {needsCollapse && !isExpanded && (
                  <button
                    className="order-summary__show-more"
                    onClick={() =>
                      setExpandedCategories((prev) => new Set([...prev, slug]))
                    }
                  >
                    +{hiddenCount} more
                  </button>
                )}

                {needsCollapse && isExpanded && (
                  <>
                    <div
                      className="order-summary__hidden-roles"
                      ref={makeHiddenRolesRef(slug)}
                    >
                      {roles.slice(VISIBLE_COUNT).map((r) => (
                        <div key={r} className="order-summary__role-chip">
                          <span className="text-body--xs font--medium color--primary">{r}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      className="order-summary__show-more"
                      onClick={() => collapseCategory(slug)}
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

      {/* Contact info (Payment page) */}
      {showContact && contactDetails.firstName && (
        <div className="order-summary__contact">
          <span className="text-label--sm color--tertiary">Contact</span>
          <span className="text-body--sm color--primary">
            {contactDetails.firstName} {contactDetails.lastName}
          </span>
          <span className="text-body--xs color--tertiary">{contactDetails.company}</span>
          <span className="text-body--xs color--tertiary">{contactDetails.email}</span>
        </div>
      )}
    </div>
  );

  return (
    <aside className="order-summary">
      <div className="order-summary__card">{inner}</div>
    </aside>
  );
}
