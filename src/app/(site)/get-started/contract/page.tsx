'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBasket } from '@/store/basketStore';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import Button from '@/components/ui/Button';
import OrderSummary from '../components/OrderSummary';
import '../details/details.css';
import './contract.css';

const CONTRACT_PDF_URL = 'https://example.com';

export default function ContractPage() {
  const router = useRouter();
  const { state, dispatch } = useBasket();
  const { selectedRoles, contactDetails } = state;

  // Guard
  useEffect(() => {
    if (selectedRoles.length === 0) {
      router.replace('/get-started');
    }
  }, [selectedRoles.length, router]);

  const [hasOpenedContract, setHasOpenedContract] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleOpenContract = () => {
    window.open(CONTRACT_PDF_URL, '_blank', 'noopener,noreferrer');
    setHasOpenedContract(true);
  };

  const handleAccept = () => {
    dispatch({ type: 'ACCEPT_CONTRACT' });
    router.push('/get-started/payment');
  };

  // Animations
  const headingRef = useTextReveal({ scroll: false, delay: 0.05 });
  const bodyRef = useFadeUp({ delay: 0.15, y: 12 });
  const acceptRef = useFadeUp({ delay: 0.25, y: 16 });
  const actionsRef = useFadeUp({ delay: 0.35, y: 16 });

  if (selectedRoles.length === 0) return null;

  return (
    <section className="contract-page">
      <div className="contract-layout">
        <div className="contract-inner">

        {/* Header */}
        <div className="contract-header">
          <h2
            ref={headingRef as React.RefObject<HTMLHeadingElement>}
            className="text-h3 color--primary"
          >
            Review and accept our Terms and Conditions
          </h2>
        </div>

        {/* Contract prompt */}
        <div
          ref={bodyRef as React.RefObject<HTMLDivElement>}
          className="contract-prompt"
        >
          <p className="text-body--sm color--secondary contract-prompt__text">
            Before proceeding, please review the full Terms and Conditions between
            Tazio Ltd and {contactDetails.company || 'your organisation'}. The
            document covers the terms of service, data protection, fees, and your
            rights under the agreement.
          </p>

          <div className="contract-prompt__action">
            <Button
              variant={hasOpenedContract ? 'secondary' : 'primary'}
              size="md"
              onClick={handleOpenContract}
            >
              {hasOpenedContract ? 'Open Terms and Conditions again ↗' : 'View Terms and Conditions ↗'}
            </Button>
            {hasOpenedContract && (
              <span className="contract-prompt__status text-body--xs">
                Terms and Conditions opened ✓
              </span>
            )}
          </div>
        </div>

        {/* Accept section */}
        <div ref={acceptRef as React.RefObject<HTMLDivElement>} className="contract-accept">
          <div className="contract-checkbox-row">
            <input
              id="contract-accept"
              type="checkbox"
              className="contract-checkbox"
              checked={accepted}
              disabled={!hasOpenedContract}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <label htmlFor="contract-accept" className="contract-checkbox-label">
              I have read and agree to the Terms and Conditions
            </label>
          </div>
          <p className="contract-hint">
            {hasOpenedContract
              ? accepted
                ? 'Terms and Conditions accepted ✓'
                : 'Please tick the box above to accept.'
              : 'You must open and review the Terms and Conditions before accepting.'}
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

        <OrderSummary showContact={true} />
      </div>
    </section>
  );
}
