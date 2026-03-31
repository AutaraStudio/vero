'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';
import { useBasket } from '@/store/basketStore';
import { TIER_DATA } from '@/lib/tierRecommendation';
import './confirmation.css';

function SuccessIcon() {
  return (
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
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        className="success-icon__check"
        d="M24 40L34 52L56 28"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ConfirmationPage() {
  const { state, dispatch } = useBasket();
  const { selectedRoles, recommendedTier, contactDetails } = state;
  const tierInfo = recommendedTier ? TIER_DATA[recommendedTier] : null;

  // Snapshot the data before clearing
  const snapshotRoles = [...selectedRoles];
  const snapshotTier = tierInfo;
  const snapshotContact = { ...contactDetails };

  useEffect(() => {
    dispatch({ type: 'CLEAR_BASKET' });
  }, [dispatch]);

  const firstName = snapshotContact.firstName;
  const company = snapshotContact.company;

  return (
    <section className="confirmation-page">
      <div className="confirmation-inner">

        <SuccessIcon />

        <div className="confirmation-heading">
          <h1 className="text-h1 color--primary">You&apos;re all set.</h1>
          <p className="text-body--lg color--secondary leading--snug">
            {firstName
              ? `Thanks ${firstName}, your assessment package is being set up.`
              : 'Your assessment package is being set up.'}
          </p>
        </div>

        <p className="text-body--md color--secondary leading--relaxed confirmation-body">
          Our team will be in touch within 24 hours to confirm your account details and get
          you live. In the meantime, if you have any questions email us at{' '}
          <a href="mailto:hello@veroassess.com">hello@veroassess.com</a>.
        </p>

        <div className="confirmation-actions">
          <Button variant="primary" size="md" href="/">
            Go to homepage
          </Button>
          <Button variant="secondary" size="md" href="/assessments">
            Browse assessments
          </Button>
        </div>

        {/* Order recap */}
        {(snapshotRoles.length > 0 || snapshotTier) && (
          <div className="confirmation-recap bordered-section">
            <div className="confirmation-recap__inner">
              <h2 className="text-h5 color--primary">Order summary</h2>

              {snapshotTier && (
                <div className="confirmation-recap__row">
                  <span className="text-label--sm color--tertiary">Plan</span>
                  <span className="section-label">{snapshotTier.name}</span>
                  <span className="text-body--sm color--primary">{snapshotTier.price} — {snapshotTier.priceNote}</span>
                  <span className="text-body--xs color--tertiary">{snapshotTier.candidateLimit} · {snapshotTier.roleLimit}</span>
                </div>
              )}

              {snapshotRoles.length > 0 && (
                <>
                  <div className="confirmation-recap__divider" />
                  <div className="confirmation-recap__row">
                    <span className="text-label--sm color--tertiary">
                      Roles ({snapshotRoles.length})
                    </span>
                    {snapshotRoles.map((role) => (
                      <span key={role.roleId} className="text-body--sm color--primary">
                        {role.roleName}{' '}
                        <span className="color--tertiary">— {role.categoryName}</span>
                      </span>
                    ))}
                  </div>
                </>
              )}

              {company && (
                <>
                  <div className="confirmation-recap__divider" />
                  <div className="confirmation-recap__row">
                    <span className="text-label--sm color--tertiary">Company</span>
                    <span className="text-body--sm color--primary">{company}</span>
                    {snapshotContact.email && (
                      <span className="text-body--xs color--tertiary">{snapshotContact.email}</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
