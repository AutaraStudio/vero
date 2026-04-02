'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBasket } from '@/store/basketStore';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import Button from '@/components/ui/Button';
import './contract.css';

export default function ContractPage() {
  const router = useRouter();
  const { state, dispatch } = useBasket();
  const { selectedRoles, contactDetails, recommendedTier } = state;
  const isStarter = recommendedTier === 'starter';
  const contractTitle = isStarter ? 'Starter Agreement' : 'Licence Agreement';

  // Guard
  useEffect(() => {
    if (selectedRoles.length === 0) {
      router.replace('/get-started');
    }
  }, [selectedRoles.length, router]);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasReadToBottom, setHasReadToBottom] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const contractBodyRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = contractBodyRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const scrollable = scrollHeight - clientHeight;
    if (scrollable <= 0) {
      setScrollProgress(1);
      setHasReadToBottom(true);
      return;
    }
    const progress = scrollTop / scrollable;
    setScrollProgress(Math.min(1, progress));
    if (scrollTop >= scrollable - 50) {
      setHasReadToBottom(true);
    }
  };

  const handleAccept = () => {
    dispatch({ type: 'ACCEPT_CONTRACT' });
    router.push('/get-started/payment');
  };

  // Animations
  const headingRef = useTextReveal({ scroll: false, delay: 0.05 });
  const partiesRef = useFadeUp({ delay: 0.15, y: 12 });
  const progressRef = useFadeUp({ delay: 0.22, y: 8 });
  const acceptRef = useFadeUp({ delay: 0.3, y: 16 });
  const actionsRef = useFadeUp({ delay: 0.4, y: 16 });

  if (selectedRoles.length === 0) return null;

  return (
    <section className="contract-page">
      <div className="contract-inner">

        {/* Header */}
        <div className="contract-header">
          <h2
            ref={headingRef as React.RefObject<HTMLHeadingElement>}
            className="text-h3 color--primary"
          >
            Review and accept your agreement
          </h2>
          <p
            ref={partiesRef as React.RefObject<HTMLParagraphElement>}
            className="text-body--sm contract-parties"
          >
            {contractTitle} · Between Tazio Ltd and{' '}
            {contactDetails.company || 'your organisation'}
          </p>
        </div>

        {/* Scrollable body */}
        <div
          ref={contractBodyRef}
          className="contract-body"
          onScroll={handleScroll}
        >
          <div className="contract-text">
            <h2>1. Definitions</h2>
            <div className="clause">
              <span className="clause-num">1.1</span>
              <p className="clause-body">
                "Agreement" means this {contractTitle} together with any Order Form and schedules
                attached hereto, all of which are incorporated by reference and form the entire
                agreement between the parties in respect of the Services.
              </p>
            </div>
            <div className="clause">
              <span className="clause-num">1.2</span>
              <p className="clause-body">
                "Services" means the Vero Assess skills-based assessment platform, including all
                features, tools, reports, and candidate-facing interfaces made available to the
                Customer under this Agreement.
              </p>
            </div>
            <div className="clause">
              <span className="clause-num">1.3</span>
              <p className="clause-body">
                "Candidate Data" means any personal data submitted by or on behalf of candidates
                using the assessment platform, including but not limited to names, email addresses,
                assessment responses, and generated reports.
              </p>
            </div>

            <h2>2. Licence Grant</h2>
            <div className="clause">
              <span className="clause-num">2.1</span>
              <p className="clause-body">
                Subject to the terms of this Agreement and payment of all applicable fees, Tazio
                Ltd grants the Customer a non-exclusive, non-transferable, revocable licence to
                access and use the Services solely for the Customer's internal business purposes
                during the Subscription Term.
              </p>
            </div>
            <div className="clause">
              <span className="clause-num">2.2</span>
              <p className="clause-body">
                The Customer may permit its authorised users to access the Services provided that
                the Customer remains fully responsible for all use of the Services by such users
                and ensures their compliance with this Agreement.
              </p>
            </div>

            <h2>3. Fees and Payment</h2>
            <div className="clause">
              <span className="clause-num">3.1</span>
              <p className="clause-body">
                The Customer agrees to pay the fees set out in the relevant Order Form or pricing
                schedule. Fees are exclusive of applicable taxes, which shall be added at the
                prevailing rate. All payments are non-refundable except as expressly set out in
                this Agreement.
              </p>
            </div>
            <div className="clause">
              <span className="clause-num">3.2</span>
              <p className="clause-body">
                Tazio Ltd reserves the right to suspend access to the Services if any undisputed
                invoice remains outstanding for more than 30 days following its due date, upon
                providing written notice to the Customer.
              </p>
            </div>

            <h2>4. Data Protection</h2>
            <div className="clause">
              <span className="clause-num">4.1</span>
              <p className="clause-body">
                Each party shall comply with all applicable data protection legislation, including
                the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act
                2018. The parties acknowledge that Tazio Ltd processes Candidate Data as a data
                processor on behalf of the Customer, who acts as the data controller.
              </p>
            </div>
            <div className="clause">
              <span className="clause-num">4.2</span>
              <p className="clause-body">
                Tazio Ltd shall implement and maintain appropriate technical and organisational
                measures to protect Candidate Data against accidental or unlawful destruction,
                loss, alteration, unauthorised disclosure, or access.
              </p>
            </div>

            <h2>5. Intellectual Property</h2>
            <div className="clause">
              <span className="clause-num">5.1</span>
              <p className="clause-body">
                All intellectual property rights in the Services, including the assessment
                frameworks, scoring methodologies, reports, and platform software, remain the
                exclusive property of Tazio Ltd. Nothing in this Agreement transfers any such
                rights to the Customer.
              </p>
            </div>

            <h2>6. Limitation of Liability</h2>
            <div className="clause">
              <span className="clause-num">6.1</span>
              <p className="clause-body">
                To the maximum extent permitted by applicable law, Tazio Ltd's total aggregate
                liability to the Customer under or in connection with this Agreement shall not
                exceed the total fees paid by the Customer in the twelve months preceding the
                claim giving rise to such liability.
              </p>
            </div>
            <div className="clause">
              <span className="clause-num">6.2</span>
              <p className="clause-body">
                Neither party shall be liable for any indirect, incidental, special, consequential,
                or punitive damages, including loss of profits, loss of data, or loss of goodwill,
                arising out of or related to this Agreement, even if advised of the possibility
                of such damages.
              </p>
            </div>

            <h2>7. Term and Termination</h2>
            <div className="clause">
              <span className="clause-num">7.1</span>
              <p className="clause-body">
                This Agreement commences on the Effective Date and continues for the Subscription
                Term set out in the Order Form, unless earlier terminated in accordance with its
                terms.
              </p>
            </div>
            <div className="clause">
              <span className="clause-num">7.2</span>
              <p className="clause-body">
                Either party may terminate this Agreement immediately by written notice if the
                other party commits a material breach and fails to remedy such breach within 30
                days of receiving written notice thereof.
              </p>
            </div>

            <h2>8. General</h2>
            <div className="clause">
              <span className="clause-num">8.1</span>
              <p className="clause-body">
                This Agreement shall be governed by and construed in accordance with the laws of
                England and Wales. Each party irrevocably submits to the exclusive jurisdiction
                of the courts of England and Wales to settle any dispute arising out of or in
                connection with this Agreement.
              </p>
            </div>
            <div className="clause">
              <span className="clause-num">8.2</span>
              <p className="clause-body">
                If any provision of this Agreement is found to be invalid or unenforceable, the
                remaining provisions shall continue in full force and effect. A waiver of any
                breach shall not constitute a waiver of any subsequent breach.
              </p>
            </div>
          </div>
        </div>

        {/* Scroll progress bar */}
        <div ref={progressRef as React.RefObject<HTMLDivElement>} className="contract-scroll-progress">
          <div
            className="contract-scroll-progress__fill"
            style={{ width: `${Math.round(scrollProgress * 100)}%` }}
          />
        </div>

        {/* Accept section */}
        <div ref={acceptRef as React.RefObject<HTMLDivElement>} className="contract-accept">
          <div className="contract-checkbox-row">
            <input
              id="contract-accept"
              type="checkbox"
              className="contract-checkbox"
              checked={accepted}
              disabled={!hasReadToBottom}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <label htmlFor="contract-accept" className="contract-checkbox-label">
              I have read and agree to the terms of this agreement
            </label>
          </div>
          <p className="contract-hint">
            {hasReadToBottom
              ? accepted
                ? 'Agreement accepted ✓'
                : 'Please tick the box above to accept.'
              : 'You must scroll to the bottom before accepting.'}
          </p>
        </div>

        {/* Actions */}
        <div ref={actionsRef as React.RefObject<HTMLDivElement>} className="contract-actions">
          <Button
            variant="primary"
            size="md"
            disabled={!accepted}
            onClick={handleAccept}
          >
            Continue to payment →
          </Button>
          <Link href="/get-started/details" className="form-back-link">
            ← Back
          </Link>
        </div>

      </div>
    </section>
  );
}
