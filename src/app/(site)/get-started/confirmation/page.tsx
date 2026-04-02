'use client';

import { useRouter } from 'next/navigation';
import { useBasket } from '@/store/basketStore';
import { TIER_DATA } from '@/lib/tierRecommendation';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import Button from '@/components/ui/Button';
import './confirmation.css';

export default function ConfirmationPage() {
  const router = useRouter();
  const { state, dispatch } = useBasket();
  const { selectedRoles, contactDetails, recommendedTier } = state;

  const tierInfo = recommendedTier ? TIER_DATA[recommendedTier] : null;
  const isHighTier = recommendedTier === 'growth' || recommendedTier === 'scale' || recommendedTier === 'bespoke';

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

  const hasKeyContact =
    !contactDetails.keyContactSameAsMe &&
    contactDetails.keyContactName &&
    contactDetails.keyContactName !== `${contactDetails.firstName} ${contactDetails.lastName}`.trim();

  const hasRoleDates = Object.values(contactDetails.roleDates).some(
    (d) => d.openDate || d.closeDate
  );

  const handleReturn = () => {
    dispatch({ type: 'CLEAR_BASKET' });
    router.push('/');
  };

  // Animations
  const iconRef = useFadeUp({ scroll: false, delay: 0.1, y: 20, duration: 0.5 });
  const headingRef = useTextReveal({ scroll: false, delay: 0.3 });
  const bodyRef = useFadeUp({ scroll: false, delay: 0.5, y: 12 });
  const recapRef = useFadeUp({ scroll: false, delay: 0.6, y: 16 });
  const actionsRef = useFadeUp({ scroll: false, delay: 0.7, y: 12 });

  return (
    <section className="confirmation-page">
      <div className="confirmation-inner">

        {/* Animated success icon */}
        <div ref={iconRef as React.RefObject<HTMLDivElement>}>
          <svg
            className="success-icon"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle
              className="success-icon__circle"
              cx="40"
              cy="40"
              r="36"
              strokeWidth="2.5"
              fill="none"
            />
            <path
              className="success-icon__check"
              d="M24 40 L34 52 L56 28"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Heading */}
        <div className="confirmation-heading">
          <h1
            ref={headingRef as React.RefObject<HTMLHeadingElement>}
            className="text-h2 color--primary"
          >
            You&apos;re all set
          </h1>
          <p
            ref={bodyRef as React.RefObject<HTMLParagraphElement>}
            className="text-body--lg color--secondary confirmation-body"
          >
            {isHighTier ? (
              <>
                Your dedicated Customer Success Manager will be in touch within 24 hours to
                confirm your setup.
              </>
            ) : (
              <>
                Your portal link will be shared within 2 working days. Check your inbox at{' '}
                <span className="color--primary">{contactDetails.email || 'your email address'}</span>.
              </>
            )}
          </p>
        </div>

        {/* Recap card */}
        <div ref={recapRef as React.RefObject<HTMLDivElement>} className="confirmation-recap">
          <div className="confirmation-recap__inner">

            {/* Roles */}
            {Object.values(rolesByCategory).map(({ name, roles }) => (
              <div key={name} className="confirmation-recap__row">
                <span className="text-label--sm color--tertiary">{name}</span>
                {roles.map((r) => (
                  <span key={r} className="text-body--sm color--primary">{r}</span>
                ))}
              </div>
            ))}

            <div className="confirmation-recap__divider" />

            {/* Plan */}
            {tierInfo && (
              <div className="confirmation-recap__row">
                <span className="text-label--sm color--tertiary">Plan</span>
                <span className="text-body--sm color--primary">
                  {tierInfo.name} — {tierInfo.price}
                </span>
                <span className="text-body--xs color--tertiary">{tierInfo.priceNote}</span>
              </div>
            )}

            <div className="confirmation-recap__divider" />

            {/* Contact */}
            <div className="confirmation-recap__row">
              <span className="text-label--sm color--tertiary">Contact</span>
              <span className="text-body--sm color--primary">
                {contactDetails.firstName} {contactDetails.lastName}
              </span>
              <span className="text-body--xs color--tertiary">{contactDetails.company}</span>
            </div>

            {/* Key contact (if different) */}
            {hasKeyContact && (
              <div className="confirmation-recap__row">
                <span className="text-label--sm color--tertiary">Key project contact</span>
                <span className="text-body--sm color--primary">{contactDetails.keyContactName}</span>
                <span className="text-body--xs color--tertiary">{contactDetails.keyContactEmail}</span>
              </div>
            )}

            {/* Campaign dates */}
            {hasRoleDates && (
              <>
                <div className="confirmation-recap__divider" />
                <div className="confirmation-recap__row">
                  <span className="text-label--sm color--tertiary">Campaign dates</span>
                  {selectedRoles.map((role) => {
                    const dates = contactDetails.roleDates[role.roleId];
                    if (!dates?.openDate && !dates?.closeDate) return null;
                    return (
                      <span key={role.roleId} className="text-body--xs color--secondary">
                        {role.roleName}
                        {dates.openDate ? ` · Opens ${dates.openDate}` : ''}
                        {dates.closeDate ? ` · Closes ${dates.closeDate}` : ''}
                      </span>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div ref={actionsRef as React.RefObject<HTMLDivElement>} className="confirmation-actions">
          <Button variant="primary" size="md" onClick={handleReturn}>
            Return to Vero Assess →
          </Button>
          <Button variant="secondary" size="md" href="#">
            Download summary
          </Button>
        </div>

      </div>
    </section>
  );
}
