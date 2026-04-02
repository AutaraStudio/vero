'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBasket } from '@/store/basketStore';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import Button from '@/components/ui/Button';
import OrderSummary from '../components/OrderSummary';
import '../details/details.css';
import './payment.css';

export default function PaymentPage() {
  const router = useRouter();
  const { state } = useBasket();
  const { selectedRoles, contractAccepted } = state;

  // Guards
  useEffect(() => {
    if (selectedRoles.length === 0) {
      router.replace('/get-started');
    } else if (!contractAccepted) {
      router.replace('/get-started/contract');
    }
  }, [selectedRoles.length, contractAccepted, router]);

  // Animations
  const headingRef = useTextReveal({ scroll: false, delay: 0.05 });
  const cardGroupRef = useFadeUp({ delay: 0.2, y: 16 });
  const billingRef = useFadeUp({ delay: 0.3, y: 16 });
  const actionsRef = useFadeUp({ delay: 0.4, y: 16 });

  if (selectedRoles.length === 0 || !contractAccepted) return null;

  return (
    <section className="payment-page">
      <div className="container">
        <div className="payment-layout">

          {/* ── Payment form ── */}
          <div className="payment-form">

            {/* Heading */}
            <div className="payment-form__heading">
              <h2
                ref={headingRef as React.RefObject<HTMLHeadingElement>}
                className="text-h3 color--primary"
              >
                Payment details
              </h2>
              <p className="text-body--sm color--tertiary">
                Your order is protected by 256-bit encryption
              </p>
            </div>

            {/* Card input group */}
            <div ref={cardGroupRef as React.RefObject<HTMLDivElement>} className="card-input-group">
              {/* Card number row */}
              <div className="card-number-row">
                <span className="card-type-icon" aria-hidden="true">
                  <svg width="38" height="24" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0.5" y="0.5" width="37" height="23" rx="3.5" fill="var(--color--surface-sunken)" stroke="var(--color--border-subtle)" />
                    <rect x="4" y="9" width="30" height="2.5" rx="1" fill="var(--color--border-default)" />
                    <rect x="4" y="14" width="8" height="2" rx="1" fill="var(--color--border-default)" />
                  </svg>
                </span>
                <input
                  type="text"
                  className="card-number-input"
                  placeholder="•••• •••• •••• ••••"
                  maxLength={19}
                  inputMode="numeric"
                  autoComplete="cc-number"
                  aria-label="Card number"
                />
              </div>

              {/* Expiry + CVC */}
              <div className="card-secondary-row">
                <input
                  type="text"
                  className="card-field"
                  placeholder="MM / YY"
                  maxLength={7}
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  aria-label="Expiry date"
                />
                <input
                  type="text"
                  className="card-field"
                  placeholder="CVC"
                  maxLength={4}
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  aria-label="CVC"
                />
              </div>

              {/* Name on card */}
              <div className="card-name-row">
                <input
                  type="text"
                  className="card-field"
                  placeholder="Name on card"
                  autoComplete="cc-name"
                  aria-label="Name on card"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Billing address */}
            <div ref={billingRef as React.RefObject<HTMLDivElement>} className="stack--md">
              <p className="text-label--sm color--tertiary">Billing address</p>
              <div className="form-field">
                <label className="form-field__label text-label--sm color--tertiary" htmlFor="billingAddress">
                  Address line 1
                </label>
                <input
                  id="billingAddress"
                  type="text"
                  className="form-field__input"
                  placeholder="123 Example Street"
                  autoComplete="address-line1"
                />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label className="form-field__label text-label--sm color--tertiary" htmlFor="billingCity">
                    City
                  </label>
                  <input
                    id="billingCity"
                    type="text"
                    className="form-field__input"
                    placeholder="London"
                    autoComplete="address-level2"
                  />
                </div>
                <div className="form-field">
                  <label className="form-field__label text-label--sm color--tertiary" htmlFor="billingPostcode">
                    Postcode
                  </label>
                  <input
                    id="billingPostcode"
                    type="text"
                    className="form-field__input"
                    placeholder="EC1A 1BB"
                    autoComplete="postal-code"
                  />
                </div>
              </div>
            </div>

            {/* Secure label */}
            <p className="secure-label text-body--xs color--tertiary">
              <span className="secure-label__icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="11" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="12" cy="17" r="1.5" fill="currentColor" />
                </svg>
              </span>
              Secured by Stripe
            </p>

            {/* Actions */}
            <div ref={actionsRef as React.RefObject<HTMLDivElement>} className="payment-actions">
              <Button
                variant="primary"
                size="md"
                href="/get-started/confirmation"
              >
                Complete order →
              </Button>
              <Link
                href="/get-started/contract"
                className="text-body--sm color--brand"
                style={{ textDecoration: 'none' }}
              >
                ← Back
              </Link>
            </div>
          </div>

          {/* ── Order summary sidebar ── */}
          <OrderSummary showContact={true} bordered={true} />
        </div>
      </div>
    </section>
  );
}
