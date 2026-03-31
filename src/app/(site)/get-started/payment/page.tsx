'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import OrderSummary from '../components/OrderSummary';
import { useBasket } from '@/store/basketStore';
import './payment.css';

// ── Card brand icons ──────────────────────────────────────────

function VisaIcon() {
  return (
    <svg width="38" height="24" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Visa" role="img">
      <rect width="38" height="24" rx="3" fill="#1A1F71" />
      <text x="6" y="17" fill="#FFFFFF" fontSize="11" fontWeight="700" fontFamily="Arial, sans-serif" letterSpacing="1">VISA</text>
    </svg>
  );
}

function MastercardIcon() {
  return (
    <svg width="38" height="24" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Mastercard" role="img">
      <circle cx="14" cy="12" r="9" fill="#EB001B" />
      <circle cx="24" cy="12" r="9" fill="#F79E1B" />
      <path d="M19 5.9C21.1 7.4 22.5 9.5 22.5 12C22.5 14.5 21.1 16.6 19 18.1C16.9 16.6 15.5 14.5 15.5 12C15.5 9.5 16.9 7.4 19 5.9Z" fill="#FF5F00" />
    </svg>
  );
}

function PadlockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="2" y="6" width="9" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.5 6V4.5C4.5 3.12 5.34 2 6.5 2C7.66 2 8.5 3.12 8.5 4.5V6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

// ── Card formatting helpers ───────────────────────────────────

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

function formatCvc(value: string) {
  return value.replace(/\D/g, '').slice(0, 4);
}

function getCardType(cardNumber: string): 'visa' | 'mastercard' | null {
  const first = cardNumber.replace(/\s/g, '')[0];
  if (first === '4') return 'visa';
  if (first === '5' || first === '2') return 'mastercard';
  return null;
}

// ── Page ──────────────────────────────────────────────────────

export default function PaymentPage() {
  const router = useRouter();
  const { state } = useBasket();
  const { contractAccepted, contactDetails } = state;

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [nameOnCard, setNameOnCard] = useState(
    contactDetails.firstName && contactDetails.lastName
      ? `${contactDetails.firstName} ${contactDetails.lastName}`
      : ''
  );
  const [processing, setProcessing] = useState(false);

  // Guard: redirect if contract not accepted
  useEffect(() => {
    if (!contractAccepted) {
      router.replace('/get-started/contract');
    }
  }, [contractAccepted, router]);

  const cardType = getCardType(cardNumber);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      router.push('/get-started/confirmation');
    }, 1500);
  };

  return (
    <section className="payment-page">
      <div className="container">
        <div className="payment-layout">

          {/* ── Left: payment form ── */}
          <form onSubmit={handleSubmit} noValidate className="payment-form">
            <div className="payment-form__heading">
              <h1 className="text-h3 color--primary">Payment details</h1>
              <p className="text-body--md color--secondary">
                Complete your purchase to get started.
              </p>
            </div>

            {/* Card input group */}
            <div>
              <label className="text-label--sm color--tertiary" style={{ display: 'block', marginBottom: '0.35rem' }}>
                Card details
              </label>
              <div className="card-input-group">

                {/* Card number row */}
                <div className="card-number-row">
                  <span className="card-type-icon" aria-live="polite">
                    {cardType === 'visa' ? <VisaIcon /> :
                     cardType === 'mastercard' ? <MastercardIcon /> :
                     null}
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="•••• •••• •••• ••••"
                    className="card-number-input"
                    autoComplete="cc-number"
                    aria-label="Card number"
                    maxLength={19}
                    required
                  />
                </div>

                {/* Expiry + CVC */}
                <div className="card-secondary-row">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    className="card-field"
                    autoComplete="cc-exp"
                    aria-label="Expiry date"
                    maxLength={5}
                    required
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cvc}
                    onChange={(e) => setCvc(formatCvc(e.target.value))}
                    placeholder="CVC"
                    className="card-field"
                    autoComplete="cc-csc"
                    aria-label="Security code"
                    maxLength={4}
                    required
                  />
                </div>

                {/* Name on card */}
                <div className="card-name-row">
                  <input
                    type="text"
                    value={nameOnCard}
                    onChange={(e) => setNameOnCard(e.target.value)}
                    placeholder="Name on card"
                    className="card-field"
                    autoComplete="cc-name"
                    aria-label="Name on card"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Secure label */}
            <span className="secure-label">
              <span className="secure-label__icon">
                <PadlockIcon />
              </span>
              <span className="text-body--xs color--tertiary">
                Secured by <strong>Stripe</strong>
              </span>
            </span>

            <div className="payment-actions">
              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={processing}
              >
                {processing ? 'Processing…' : 'Complete purchase →'}
              </Button>
              <Button variant="secondary" size="md" href="/get-started/contract">
                ← Back
              </Button>
            </div>
          </form>

          {/* ── Right: order summary ── */}
          <OrderSummary showContact bordered />

        </div>
      </div>
    </section>
  );
}
