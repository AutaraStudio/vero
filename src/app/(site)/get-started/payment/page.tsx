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
import './payment.css';

export default function PaymentPage() {
  const router = useRouter();
  const { state } = useBasket();
  const { selectedRoles, contractAccepted, contactDetails } = state;

  const [payMethod, setPayMethod] = useState<'card' | 'invoice'>('card');

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
  const methodRef = useFadeUp({ delay: 0.15, y: 12 });
  const cardGroupRef = useFadeUp({ delay: 0.2, y: 16 });
  const billingRef = useFadeUp({ delay: 0.3, y: 16 });
  const trustRef = useFadeUp({ delay: 0.35, y: 12 });
  const actionsRef = useFadeUp({ delay: 0.4, y: 16 });
  const nextStepsRef = useFadeUp({ delay: 0.5, y: 16 });

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

            {/* Payment method toggle */}
            <div ref={methodRef as React.RefObject<HTMLDivElement>} className="payment-method-tabs">
              <button
                className={`payment-method-tab${payMethod === 'card' ? ' is-active' : ''}`}
                onClick={() => setPayMethod('card')}
                type="button"
              >
                <span className="payment-method-tab__icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </span>
                Card
              </button>
              <button
                className={`payment-method-tab${payMethod === 'invoice' ? ' is-active' : ''}`}
                onClick={() => setPayMethod('invoice')}
                type="button"
              >
                <span className="payment-method-tab__icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    <path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </span>
                Pay by invoice
              </button>
            </div>

            {payMethod === 'card' ? (
              <>
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
                  {/* VAT number */}
                  <div className="form-field">
                    <label className="form-field__label text-label--sm color--tertiary" htmlFor="vatNumber">
                      VAT number <span className="text-body--xs color--tertiary">(optional)</span>
                    </label>
                    <input
                      id="vatNumber"
                      type="text"
                      className="form-field__input"
                      placeholder="GB123456789"
                      autoComplete="off"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="invoice-notice">
                <p className="text-body--sm color--secondary">
                  We&apos;ll send an invoice to <strong>{contactDetails.email}</strong> within one
                  working day. Payment terms are 30 days from invoice date.
                </p>
                <p className="text-body--sm color--secondary">
                  Your account will be activated once payment is received.
                </p>
              </div>
            )}

            {/* Trust strip */}
            <div ref={trustRef as React.RefObject<HTMLDivElement>} className="trust-strip">
              {[
                {
                  label: '256-bit SSL encryption',
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="11" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <circle cx="12" cy="17" r="1.5" fill="currentColor"/>
                    </svg>
                  ),
                },
                {
                  label: 'PCI DSS compliant',
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ),
                },
                {
                  label: 'GDPR compliant',
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ),
                },
                {
                  label: 'Powered by Stripe',
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  ),
                },
              ].map(({ icon, label }) => (
                <div key={label} className="trust-item">
                  <span className="trust-item__icon" aria-hidden="true">{icon}</span>
                  <span className="text-body--xs color--tertiary">{label}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div ref={actionsRef as React.RefObject<HTMLDivElement>} className="payment-actions">
              <Button
                variant="primary"
                size="md"
                href="/get-started/confirmation"
              >
                Complete order →
              </Button>
              <Link href="/get-started/contract" className="form-back-link">
                ← Back
              </Link>
            </div>

            {/* What happens next */}
            <div ref={nextStepsRef as React.RefObject<HTMLDivElement>} className="payment-next-steps">
              <div className="payment-next-steps__header">
                <p className="text-h5 color--primary">What happens next</p>
                <p className="text-body--sm color--secondary">
                  Here&apos;s what to expect after you complete your order.
                </p>
              </div>
              <ol className="payment-next-steps__list">
                {[
                  {
                    step: '1',
                    title: 'Order confirmed',
                    body: "You'll receive a confirmation email immediately with your order details.",
                  },
                  {
                    step: '2',
                    title: 'Account set up',
                    body: "Our team will build your assessment portal based on the roles and settings you've selected.",
                  },
                  {
                    step: '3',
                    title: "You're live",
                    body: "You'll receive your portal link and access instructions within 2 working days.",
                  },
                ].map(({ step, title, body }) => (
                  <li key={step} className="payment-next-step">
                    <span className="payment-next-step__num" aria-hidden="true">{step}</span>
                    <div className="payment-next-step__content">
                      <span className="text-body--sm font--medium color--primary">{title}</span>
                      <span className="text-body--sm color--secondary">{body}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Support CTA */}
            <div className="payment-contact">
              <div className="payment-contact__header">
                <p className="text-h5 color--primary">Questions?</p>
                <p className="text-body--sm color--secondary">
                  Our team is here to help you complete your order.
                </p>
              </div>
              <div className="payment-contact__options">
                <a href="mailto:support@veroassess.com" className="payment-contact__option">
                  <span className="payment-contact__icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M2 8l10 6 10-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <div className="payment-contact__option-text">
                    <span className="text-label--sm color--tertiary">Email</span>
                    <span className="text-body--sm font--medium color--primary">support@veroassess.com</span>
                  </div>
                </a>
                <a href="tel:+441234567890" className="payment-contact__option">
                  <span className="payment-contact__icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.8 12.4 19.79 19.79 0 0 1 1.73 3.8 2 2 0 0 1 3.72 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.69a16 16 0 0 0 6.29 6.29l1.06-1.06a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <div className="payment-contact__option-text">
                    <span className="text-label--sm color--tertiary">Phone</span>
                    <span className="text-body--sm font--medium color--primary">+44 (0)1234 567890</span>
                  </div>
                </a>
              </div>
            </div>

          </div>

          {/* ── Order summary sidebar ── */}
          <OrderSummary showContact={true} />
        </div>
      </div>
    </section>
  );
}
