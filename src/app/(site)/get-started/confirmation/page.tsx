'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBasket } from '@/store/basketStore';
import { TIER_DATA, getTierPrice } from '@/lib/tierRecommendation';
import { downloadSummaryPdf } from '@/lib/summaryPdf';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import Button from '@/components/ui/Button';
import './confirmation.css';

export default function ConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  );
}

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, dispatch } = useBasket();

  /* Snapshot the basket state on first render so the receipt below has
     stable data to render from, then clear the live basket. Without this
     snapshot, dispatching CLEAR_BASKET here would blank out the page
     mid-render. With it, the page renders the order from frozen state
     while the nav basket count drops to zero immediately — fixing the
     bug where the basket lingered after a successful purchase until the
     user clicked "Return to Vero Assess". */
  const [snapshot] = useState(() => state);
  const { selectedRoles, contactDetails, recommendedTier, paymentFrequency, autoRenewal, isBespokeEnquiry, bespokeDetails } = snapshot;

  const [sessionVerified, setSessionVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Verify payment if returning from checkout
  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (sessionId && !sessionVerified && !verifying) {
      setVerifying(true);
      fetch(`/api/checkout/verify?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'complete' || data.paymentStatus === 'paid') {
            setSessionVerified(true);
          }
        })
        .catch(() => {
          // Non-critical — the page still shows the receipt
        })
        .finally(() => setVerifying(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /* Clear the live basket once the confirmation page has mounted with
     a snapshot in hand. Runs once. The receipt continues to render
     from the snapshot above. */
  useEffect(() => {
    dispatch({ type: 'CLEAR_BASKET' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tierInfo = recommendedTier ? TIER_DATA[recommendedTier] : null;
  const { price: tierPrice } = tierInfo
    ? getTierPrice(tierInfo, paymentFrequency)
    : { price: '' };
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

  const [downloading, setDownloading] = useState(false);

  const handleDownloadSummary = async () => {
    if (!tierInfo || downloading) return;
    setDownloading(true);
    try {
      const method = searchParams.get('method');
      await downloadSummaryPdf({
        contactDetails,
        selectedRoles: selectedRoles.map((r) => ({
          roleId: r.roleId,
          roleName: r.roleName,
          categoryName: r.categoryName,
        })),
        tierInfo,
        price: tierPrice,
        priceNote: tierInfo ? getTierPrice(tierInfo, paymentFrequency).priceNote : '',
        paymentFrequency,
        autoRenewal,
        paymentMethod: method === 'invoice' ? 'invoice' : 'card',
      });
    } finally {
      setDownloading(false);
    }
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
        {isBespokeEnquiry ? (
          <div className="confirmation-hero">
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
                Enquiry received
              </h1>
              <p
                ref={bodyRef as React.RefObject<HTMLParagraphElement>}
                className="text-body--lg color--secondary confirmation-body-text"
              >
                Your dedicated account manager will be in touch within 24 hours to
                discuss your requirements and build a tailored solution.
              </p>
            </div>
          </div>
        ) : (
          <div className="confirmation-hero">
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
        )}

        {/* ── What happens next ── */}
        {isBespokeEnquiry ? (
          <div className="confirmation-next-steps">
            <p className="text-label--sm color--tertiary confirmation-next-steps__label">What happens next</p>
            <ol className="confirmation-next-steps__list">
              {([
                {
                  num: '1',
                  title: 'Enquiry reviewed',
                  body: 'Our team will review your role selection and requirements before reaching out.',
                },
                {
                  num: '2',
                  title: 'Discovery call',
                  body: "We'll schedule a call within 24 hours to understand your needs in detail and answer any questions.",
                },
                {
                  num: '3',
                  title: 'Tailored proposal',
                  body: "We'll put together a custom solution and pricing proposal based on your specific requirements.",
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
        ) : (
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
        )}

        {/* ── Order receipt ── */}
        {isBespokeEnquiry ? (
          <div className="confirmation-receipt">
            <button
              className="confirmation-receipt__toggle"
              onClick={() => setReceiptOpen((p) => !p)}
              type="button"
              aria-expanded={receiptOpen}
            >
              <div className="confirmation-receipt__summary">
                <span className="section-label confirmation-receipt__tier">Bespoke enquiry</span>
                <span className="text-body--sm color--secondary">
                  {selectedRoles.length} roles · {bespokeDetails.firstName} {bespokeDetails.lastName}
                </span>
              </div>
              <div className="confirmation-receipt__expand">
                <span className="text-body--xs color--brand">
                  {receiptOpen ? 'Hide details' : 'View enquiry details'}
                </span>
                <span
                  className={`confirmation-receipt__chevron${receiptOpen ? ' is-open' : ''}`}
                  aria-hidden="true"
                />
              </div>
            </button>

            {receiptOpen && (
              <div className="confirmation-receipt__detail">

                {/* Contact */}
                <div className="confirmation-receipt__section">
                  <span className="text-label--sm color--tertiary">Contact</span>
                  <span className="text-body--sm font--medium color--primary">
                    {bespokeDetails.firstName} {bespokeDetails.lastName}
                  </span>
                  <span className="text-body--xs color--tertiary">{bespokeDetails.company}</span>
                  <span className="text-body--xs color--tertiary">{bespokeDetails.email}</span>
                </div>

                <div className="confirmation-receipt__divider" />

                {/* Requirements */}
                <div className="confirmation-receipt__section">
                  <span className="text-label--sm color--tertiary">Requirements submitted</span>
                  {bespokeDetails.approxRoles && (
                    <span className="text-body--xs color--secondary">Roles: {bespokeDetails.approxRoles}</span>
                  )}
                  {bespokeDetails.approxCandidates && (
                    <span className="text-body--xs color--secondary">Candidates/yr: {bespokeDetails.approxCandidates}</span>
                  )}
                  {bespokeDetails.targetGoLive && (
                    <span className="text-body--xs color--secondary">Target go-live: {bespokeDetails.targetGoLive}</span>
                  )}
                  {bespokeDetails.requirements && (
                    <span className="text-body--xs color--secondary">{bespokeDetails.requirements}</span>
                  )}
                </div>

                <div className="confirmation-receipt__divider" />

                {/* Roles */}
                <div className="confirmation-receipt__section">
                  <span className="text-label--sm color--tertiary">Roles of interest ({selectedRoles.length})</span>
                  <div className="confirmation-roles-list">
                    {Object.entries(rolesByCategory).map(([, { name, roles }]) => (
                      <div key={name} className="confirmation-role-group">
                        <span className="text-label--sm color--tertiary">{name}</span>
                        <div className="confirmation-role-chips">
                          {roles.map((r) => (
                            <span key={r} className="confirmation-role-chip text-body--xs color--primary">{r}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        ) : (
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
                    <span className="text-h4 color--primary">{tierPrice}</span>
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
        )}

        {/* ── Actions ── */}
        <div ref={actionsRef as React.RefObject<HTMLDivElement>} className="confirmation-actions">
          <Button variant="primary" size="md" onClick={handleReturn}>
            Return to Vero Assess →
          </Button>
          {!isBespokeEnquiry && (
            <Button variant="secondary" size="md" onClick={handleDownloadSummary} disabled={downloading}>
              {downloading ? 'Generating PDF...' : 'Download summary'}
            </Button>
          )}
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
            <a href="tel:+442922331888" className="confirmation-contact__option">
              <span className="confirmation-contact__icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.8 12.4 19.79 19.79 0 0 1 1.73 3.8 2 2 0 0 1 3.72 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.69a16 16 0 0 0 6.29 6.29l1.06-1.06a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <div className="confirmation-contact__option-text">
                <span className="text-label--sm color--tertiary">Phone</span>
                <span className="text-body--sm font--medium color--primary">+44 (0)2922 331 888</span>
              </div>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
