'use client';

import { useBasket } from '@/store/basketStore';
import { TIER_DATA } from '@/lib/tierRecommendation';

interface OrderSummaryProps {
  showContact?: boolean;
  bordered?: boolean;
}

export default function OrderSummary({ showContact = false, bordered = false }: OrderSummaryProps) {
  const { state } = useBasket();
  const { selectedRoles, recommendedTier, contactDetails } = state;
  const tierInfo = recommendedTier ? TIER_DATA[recommendedTier] : null;

  const rolesByCategory = selectedRoles.reduce<Record<string, { name: string; roles: string[] }>>(
    (acc, role) => {
      if (!acc[role.categorySlug]) {
        acc[role.categorySlug] = { name: role.categoryName, roles: [] };
      }
      acc[role.categorySlug].roles.push(role.roleName);
      return acc;
    },
    {}
  );

  const inner = (
    <div className="order-summary__inner stack--lg">
      <h3 className="text-h5 color--primary">Order summary</h3>

      {/* Roles */}
      {selectedRoles.length === 0 ? (
        <p className="text-body--sm color--tertiary">No roles selected.</p>
      ) : (
        <div className="stack--md">
          {Object.values(rolesByCategory).map(({ name, roles }) => (
            <div key={name} className="stack--xs">
              <span className="text-label--sm color--tertiary">{name}</span>
              {roles.map((r) => (
                <span key={r} className="text-body--sm color--primary">{r}</span>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Tier */}
      {tierInfo && (
        <div className="stack--xs order-summary__tier">
          <span className="text-label--sm color--tertiary">Recommended plan</span>
          <span className="section-label">{tierInfo.name}</span>
          <span className="text-body--sm font--medium color--primary">{tierInfo.price}</span>
          <span className="text-body--xs color--tertiary">{tierInfo.priceNote}</span>
          <span className="text-body--xs color--tertiary">{tierInfo.candidateLimit}</span>
          <span className="text-body--xs color--tertiary">{tierInfo.roleLimit}</span>
        </div>
      )}

      {/* Contact info (Payment page) */}
      {showContact && contactDetails.firstName && (
        <div className="stack--xs order-summary__contact">
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

  if (bordered) {
    return (
      <aside className="order-summary">
        <div className="bordered-section order-summary__bordered">
          <div className="order-summary__bordered-inner">{inner}</div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="order-summary">
      <div className="order-summary__card">{inner}</div>
    </aside>
  );
}
