'use client';

import { useState } from 'react';
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
  const isHighTier =
    recommendedTier === 'growth' ||
    recommendedTier === 'scale' ||
    recommendedTier === 'bespoke';

  const [datesOpen, setDatesOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const rolesByCategory = selectedRoles.reduce<
    Record<string, { name: string; roles: string[] }>
  >((acc, role) => {
    if (!acc[role.categorySlug]) {
      acc[role.categorySlug] = { name: role.categoryName, roles: [] };
    }
    acc[role.categorySlug].roles.push(role.roleName);
    return acc;
  }, {});

  const hasKeyContact =
    !contactDetails.keyContactSameAsMe &&
    !!contactDetails.keyContactName &&
    contactDetails.keyContactName !==
      `${contactDetails.firstName} ${contactDetails.lastName}`.trim();

  const datedRoles = selectedRoles.filter((role) => {
    const d = contactDetails.roleDates[role.roleId];
    return d?.openDate || d?.closeDate;
  });
  const hasRoleDates = datedRoles.length > 0;

  const handleReturn = () => {
    dispatch({ type: 'CLEAR_BASKET' });
    router.push('/');
  };

  // Animations
  const iconRef    = useFadeUp({ scroll: false, delay: 0.1,  y: 20, duration: 0.5 });
  const headingRef = useTextReveal({ scroll: false, delay: 0.3 });
  const bodyRef    = useFadeUp({ scroll: false, delay: 0.5,  y: 12 });
  const gridRef    = useFadeUp({ scroll: false, delay: 0.65, y: 16 });
  const actionsRef = useFadeUp({ scroll: false, delay: 0.75, y: 12 });

  return (
    <section className="confirmation-page">
      <div className="confirmation-inner">

        {/* ── Hero ── */}
        <div className="confirmation-hero">

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

          <div className="confirmation-heading">
            <h1
              ref={headingRef as React.RefObject<HTMLHeadingElement>}
              className="text-h2 color--primary"
            >
              You&apos;re all set
            </h1>
            <p
              ref={bodyRef as React.RefObject<HTMLParagraphElement>}
              className="text-body--lg confirmation-body-text color--secondary"
            >
              {isHighTier ? (
                <>
                  Your dedicated Customer Success Manager will be in touch within 24 hours to
                  confirm your setup.
                </>
              ) : (
                <>
                  Your portal link will be shared within 2 working days. Check your inbox at{' '}
                  <span className="color--primary">
                    {contactDetails.email || 'your email address'}
                  </span>.
                </>
              )}
            </p>
          </div>
        </div>

        {/* ── What happens next ── */}
        <div className="confirmation-next-steps">
          <div className="confirmation-next-steps__header">
            <p className="text-h5 color--primary">What happens next</p>
            <p className="text-body--sm color--secondary">
              Here&apos;s what to expect after your order is confirmed.
            </p>
          </div>
          <ol className="confirmation-next-steps__list">
            {([
              {
                num: '1',
                title: 'Order confirmed',
                body: 'A confirmation email is on its way with your full order details and invoice.',
              },
              {
                num: '2',
                title: 'Account built',
                body: isHighTier
                  ? 'Your Success Manager will call within 24 hours to confirm setup details.'
                  : "We'll configure your assessment portal based on the roles and settings you chose.",
              },
              {
                num: '3',
                title: "You're live",
                body: isHighTier
                  ? 'Portal access and instructions will be shared once your setup is confirmed.'
                  : 'Your portal link and access instructions will arrive within 2 working days.',
              },
            ] as const).map(({ num, title, body }) => (
              <li key={num} className="confirmation-next-step">
                <span className="confirmation-next-step__num" aria-hidden="true">{num}</span>
                <div className="confirmation-next-step__content">
                  <span className="text-body--sm font--medium color--primary">{title}</span>
                  <span className="text-body--sm color--secondary">{body}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* ── Order receipt ── */}
        <div className="confirmation-receipt">

          {/* Always-visible summary toggle */}
          <button
            className="confirmation-receipt__toggle"
            onClick={() => setReceiptOpen((p) => !p)}
            type="button"
            aria-expanded={receiptOpen}
          >
            <div className="confirmation-receipt__summary">
              {tierInfo && (
                <span className="section-label confirmation-receipt__tier">{tierInfo.name}</span>
              )}
              <span className="text-body--sm color--secondary">
                {selectedRoles.length} role{selectedRoles.length !== 1 ? 's' : ''} across{' '}
                {Object.keys(rolesByCategory).length} categor{Object.keys(rolesByCategory).length !== 1 ? 'ies' : 'y'}
              </span>
              <span className="confirmation-receipt__dot" aria-hidden="true" />
              <span className="text-body--sm color--secondary">
                {contactDetails.firstName} {contactDetails.lastName}
                {contactDetails.company ? `, ${contactDetails.company}` : ''}
              </span>
            </div>
            <div className="confirmation-receipt__expand">
              <span className="text-body--xs color--brand">
                {receiptOpen ? 'Hide details' : 'View full order'}
              </span>
              <span
                className={`confirmation-receipt__chevron${receiptOpen ? ' is-open' : ''}`}
                aria-hidden="true"
              />
            </div>
          </button>

          {/* Expandable detail */}
          {receiptOpen && (
            <div className="confirmation-receipt__detail">

              {/* Roles */}
              <div className="confirmation-receipt__section">
                <span className="text-label--sm color--tertiary">Roles</span>
                <div className="confirmation-roles-list">
                  {Object.entries(rolesByCategory).map(([, { name, roles }]) => (
                    <div key={name} className="confirmation-role-group">
                      <span className="text-label--sm color--tertiary">{name}</span>
                      <div className="confirmation-role-chips">
                        {roles.map((r) => (
                          <span key={r} className="confirmation-role-chip text-body--xs color--primary">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="confirmation-receipt__divider" />

              {/* Plan */}
              {tierInfo && (
                <div className="confirmation-receipt__section confirmation-receipt__plan-row">
                  <div className="confirmation-receipt__plan-left">
                    <span className="text-label--sm color--tertiary">Plan</span>
                    <span className="text-body--sm font--medium color--primary">{tierInfo.name}</span>
                    <span className="text-body--xs color--tertiary">
                      {tierInfo.candidateLimit} · {tierInfo.roleLimit}
                    </span>
                  </div>
                  <span className="text-h4 color--primary">{tierInfo.price}</span>
                </div>
              )}

              <div className="confirmation-receipt__divider" />

              {/* Contact */}
              <div className="confirmation-receipt__section">
                <span className="text-label--sm color--tertiary">Account contact</span>
                <span className="text-body--sm font--medium color--primary">
                  {contactDetails.firstName} {contactDetails.lastName}
                </span>
                {contactDetails.company && (
                  <span className="text-body--xs color--tertiary">{contactDetails.company}</span>
                )}
                <span className="text-body--xs color--tertiary">{contactDetails.email}</span>
                {hasKeyContact && (
                  <div className="confirmation-receipt__sub-section">
                    <span className="text-label--sm color--tertiary">Project contact</span>
                    <span className="text-body--sm color--primary">{contactDetails.keyContactName}</span>
                    <span className="text-body--xs color--tertiary">{contactDetails.keyContactEmail}</span>
                  </div>
                )}
              </div>

              {/* Campaign dates */}
              {hasRoleDates && (
                <>
                  <div className="confirmation-receipt__divider" />
                  <div className="confirmation-receipt__section">
                    <span className="text-label--sm color--tertiary">Campaign dates</span>
                    {selectedRoles.map((role) => {
                      const dates = contactDetails.roleDates[role.roleId];
                      if (!dates?.openDate && !dates?.closeDate) return null;
                      return (
                        <div key={role.roleId} className="confirmation-date-row">
                          <span className="text-body--xs color--secondary">{role.roleName}</span>
                          <span className="text-body--xs color--tertiary">
                            {dates.openDate ? `Opens ${dates.openDate}` : ''}
                            {dates.openDate && dates.closeDate ? ' · ' : ''}
                            {dates.closeDate ? `Closes ${dates.closeDate}` : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

            </div>
          )}
        </div>

        {/* ── Actions ── */}
        <div ref={actionsRef as React.RefObject<HTMLDivElement>} className="confirmation-actions">
          <Button variant="primary" size="md" onClick={handleReturn}>
            Return to Vero Assess
          </Button>
          <Button variant="secondary" size="md" href="#">
            Download summary
          </Button>
        </div>

        {/* ── Support ── */}
        <div className="confirmation-contact">
          <div className="confirmation-contact__header">
            <p className="text-h5 color--primary">Questions?</p>
            <p className="text-body--sm color--secondary">
              Our team is here to help.
            </p>
          </div>
          <div className="confirmation-contact__options">
            <a href="mailto:support@veroassess.com" className="confirmation-contact__option">
              <span className="confirmation-contact__icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M2 8l10 6 10-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <div className="confirmation-contact__option-text">
                <span className="text-label--sm color--tertiary">Email</span>
                <span className="text-body--sm font--medium color--primary">support@veroassess.com</span>
              </div>
            </a>
            <a href="tel:+441234567890" className="confirmation-contact__option">
              <span className="confirmation-contact__icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.8 12.4 19.79 19.79 0 0 1 1.73 3.8 2 2 0 0 1 3.72 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.69a16 16 0 0 0 6.29 6.29l1.06-1.06a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <div className="confirmation-contact__option-text">
                <span className="text-label--sm color--tertiary">Phone</span>
                <span className="text-body--sm font--medium color--primary">+44 (0)1234 567890</span>
              </div>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
