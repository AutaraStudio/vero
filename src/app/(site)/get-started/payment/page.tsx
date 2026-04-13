'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useBasket } from '@/store/basketStore';
import { TIER_DATA } from '@/lib/tierRecommendation';
import { stripePromise } from '@/lib/stripeClient';
import type { CheckoutPayload } from '@/lib/checkout-schema';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import Button from '@/components/ui/Button';
import OrderSummary from '../components/OrderSummary';
import '../details/details.css';
import './payment.css';

export default function PaymentPage() {
  return (
    <Suspense>
      <PaymentContent />
    </Suspense>
  );
}

// ── Stripe Payment Form (inside Elements provider) ──────────

function StripePaymentForm({
  onSuccess,
  onError,
}: {
  onSuccess: () => void;
  onError: (message: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [ready, setReady] = useState(false);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;

    setIsProcessing(true);
    onError('');

    const { error } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/get-started/confirmation`,
      },
    });

    if (error) {
      onError(error.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <>
      <div className="stripe-element-wrapper">
        <PaymentElement
          onReady={() => setReady(true)}
          options={{ layout: 'tabs' }}
        />
        {!ready && (
          <div className="stripe-element-loading">
            <span className="text-body--sm color--tertiary">Loading payment form...</span>
          </div>
        )}
      </div>
      <div className="payment-actions">
        <Button
          variant="primary"
          size="md"
          onClick={handleSubmit}
          disabled={!stripe || !elements || isProcessing || !ready}
        >
          {isProcessing ? 'Processing payment...' : 'Complete order →'}
        </Button>
        <Link href="/get-started/contract" className="form-back-link">
          ← Back
        </Link>
      </div>
    </>
  );
}

// ── Main payment content ────────────────────────────────────

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, dispatch } = useBasket();
  const { selectedRoles, contractAccepted, contactDetails, recommendedTier, paymentFrequency, autoRenewal } = state;

  const [payMethod, setPayMethod] = useState<'card' | 'invoice'>('card');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentCreated, setIntentCreated] = useState(false);

  // Starter is a one-off payment — no renewal concept
  const tierInfo = recommendedTier ? TIER_DATA[recommendedTier] : null;
  const isSubscription = tierInfo?.hasFrequencyToggle ?? false;
  const showAutoRenewal = isSubscription && paymentFrequency === 'annual';

  const wasCancelled = searchParams.get('cancelled') === 'true';

  // Guards
  useEffect(() => {
    if (selectedRoles.length === 0) {
      router.replace('/get-started');
    } else if (!contractAccepted) {
      router.replace('/get-started/contract');
    }
  }, [selectedRoles.length, contractAccepted, router]);

  // ── Build checkout payload ──

  const buildPayload = useCallback((): CheckoutPayload => {
    return {
      selectedRoles: selectedRoles.map((r) => ({
        roleId: r.roleId,
        roleName: r.roleName,
        categoryName: r.categoryName,
        categorySlug: r.categorySlug,
      })),
      tier: recommendedTier!,
      paymentFrequency,
      autoRenewal,
      paymentMethod: 'card',
      contactDetails: {
        firstName: contactDetails.firstName,
        lastName: contactDetails.lastName,
        email: contactDetails.email,
        company: contactDetails.company,
        jobTitle: contactDetails.jobTitle,
        phone: contactDetails.phone,
        keyContactName: contactDetails.keyContactName,
        keyContactEmail: contactDetails.keyContactEmail,
        keyContactSameAsMe: contactDetails.keyContactSameAsMe,
        usersToAdd: contactDetails.usersToAdd,
        bespokeUrl: contactDetails.bespokeUrl,
        sendFeedbackReports: contactDetails.sendFeedbackReports,
        brandColour1: contactDetails.brandColour1,
        brandColour2: contactDetails.brandColour2,
        logoFile: contactDetails.logoFile,
        logoFileName: contactDetails.logoFileName,
        roleDates: contactDetails.roleDates,
      },
    };
  }, [selectedRoles, recommendedTier, paymentFrequency, autoRenewal, contactDetails]);

  // ── Create Payment Intent when card tab is active ──

  useEffect(() => {
    if (payMethod !== 'card' || intentCreated || clientSecret) return;
    if (!recommendedTier || selectedRoles.length === 0) return;

    setIntentCreated(true);

    fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload()),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setError(data.error || 'Failed to initialize payment');
        }
      })
      .catch(() => {
        setError('Failed to connect to payment service');
      });
  }, [payMethod, intentCreated, clientSecret, recommendedTier, selectedRoles.length, buildPayload]);

  // ── Handle successful payment ──

  const handlePaymentSuccess = () => {
    router.push('/get-started/confirmation');
  };

  // ── Handle invoice checkout ──

  async function handleInvoiceCheckout() {
    setError(null);
    setIsLoading(true);

    try {
      const payload = buildPayload();
      payload.paymentMethod = 'invoice';

      const res = await fetch('/api/checkout/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit order');

      router.push('/get-started/confirmation?method=invoice');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  }

  // Animations
  const headingRef = useTextReveal({ scroll: false, delay: 0.05 });
  const methodRef = useFadeUp({ delay: 0.15, y: 12 });
  const cardFormRef = useFadeUp({ delay: 0.2, y: 16 });
  const renewalRef = useFadeUp({ delay: 0.3, y: 12 });
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

            {/* Cancelled notice */}
            {wasCancelled && (
              <div className="payment-cancelled-notice">
                <p className="text-body--sm color--secondary">
                  Payment was cancelled. You can try again when you&apos;re ready.
                </p>
              </div>
            )}

            {/* Error notice */}
            {error && (
              <div className="payment-error-notice">
                <p className="text-body--sm">{error}</p>
                <button
                  type="button"
                  className="payment-error-notice__dismiss"
                  onClick={() => setError(null)}
                  aria-label="Dismiss error"
                >
                  &times;
                </button>
              </div>
            )}

            {/* Payment method toggle */}
            <div ref={methodRef as React.RefObject<HTMLDivElement>} className="payment-method-tabs">
              <button
                className={`payment-method-tab${payMethod === 'card' ? ' is-active' : ''}`}
                onClick={() => { setPayMethod('card'); setError(null); }}
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
                onClick={() => { setPayMethod('invoice'); setError(null); }}
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
              <div ref={cardFormRef as React.RefObject<HTMLDivElement>}>
                {clientSecret ? (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: 'flat',
                        variables: {
                          // Core brand
                          colorPrimary: '#472d6a',
                          colorBackground: '#ffffff',
                          colorText: '#201530',
                          colorTextSecondary: '#6b5a7e',
                          colorTextPlaceholder: '#9b8dab',

                          // Surfaces
                          colorDanger: '#f15f23',

                          // Shape
                          borderRadius: '4px',
                          spacingUnit: '4px',
                          spacingGridRow: '16px',
                          spacingGridColumn: '16px',

                          // Typography — matches Aptos
                          fontFamily: 'Aptos, system-ui, -apple-system, sans-serif',
                          fontSizeBase: '14px',
                          fontSizeSm: '13px',
                          fontWeightNormal: '400',
                          fontWeightMedium: '500',
                          fontWeightBold: '600',

                          // Focus ring
                          focusBoxShadow: '0 0 0 3px rgba(71, 45, 106, 0.15)',
                          focusOutline: 'none',
                        },
                        rules: {
                          '.Input': {
                            border: '1px solid rgba(71, 45, 106, 0.2)',
                            boxShadow: 'none',
                            padding: '10px 12px',
                            fontSize: '14px',
                            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                          },
                          '.Input:focus': {
                            border: '1px solid #472d6a',
                            boxShadow: '0 0 0 3px rgba(71, 45, 106, 0.15)',
                          },
                          '.Input:hover': {
                            border: '1px solid rgba(71, 45, 106, 0.35)',
                          },
                          '.Input--invalid': {
                            border: '1px solid #f15f23',
                            boxShadow: 'none',
                          },
                          '.Label': {
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#6b5a7e',
                            textTransform: 'none',
                            letterSpacing: '0',
                            marginBottom: '6px',
                          },
                          '.Tab': {
                            border: '1px solid rgba(71, 45, 106, 0.2)',
                            borderRadius: '4px',
                            boxShadow: 'none',
                            padding: '10px 16px',
                            transition: 'border-color 0.15s ease, background-color 0.15s ease',
                          },
                          '.Tab:hover': {
                            border: '1px solid rgba(71, 45, 106, 0.35)',
                            backgroundColor: 'rgba(71, 45, 106, 0.04)',
                          },
                          '.Tab--selected': {
                            border: '1px solid #472d6a',
                            backgroundColor: '#ffffff',
                            boxShadow: 'none',
                            color: '#472d6a',
                          },
                          '.TabIcon--selected': {
                            color: '#472d6a',
                          },
                          '.Error': {
                            fontSize: '13px',
                            color: '#f15f23',
                          },
                          '.CheckboxInput': {
                            borderColor: 'rgba(71, 45, 106, 0.2)',
                          },
                          '.CheckboxInput--checked': {
                            backgroundColor: '#472d6a',
                            borderColor: '#472d6a',
                          },
                        },
                      },
                    }}
                  >
                    <StripePaymentForm
                      onSuccess={handlePaymentSuccess}
                      onError={(msg) => setError(msg || null)}
                    />
                  </Elements>
                ) : (
                  <div className="stripe-element-loading">
                    <span className="text-body--sm color--tertiary">
                      Initializing secure payment...
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="invoice-notice">
                  <p className="text-body--sm color--secondary">
                    We&apos;ll send an invoice to <strong>{contactDetails.email}</strong> within one
                    working day. Payment terms are 30 days from invoice date.
                  </p>
                  <p className="text-body--sm color--secondary">
                    Your account will be activated once payment is received.
                  </p>
                </div>

                {/* Invoice actions */}
                <div ref={actionsRef as React.RefObject<HTMLDivElement>} className="payment-actions">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleInvoiceCheckout}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Submitting...' : 'Complete order →'}
                  </Button>
                  <Link href="/get-started/contract" className="form-back-link">
                    ← Back
                  </Link>
                </div>
              </>
            )}

            {/* Auto-renewal option — annual subscriptions only */}
            {showAutoRenewal && (
              <div ref={renewalRef as React.RefObject<HTMLDivElement>} className="auto-renewal-option">
                <div className="auto-renewal-option__content">
                  <div className="auto-renewal-option__text">
                    <p className="text-body--sm font--medium color--primary">
                      Auto-renew in 12 months
                    </p>
                    <p className="text-body--xs color--tertiary">
                      Your licence will automatically renew at the end of your 12-month term.
                      You can change this at any time before your renewal date.
                    </p>
                  </div>
                  <label className="toggle-switch" htmlFor="autoRenewal">
                    <input
                      type="checkbox"
                      id="autoRenewal"
                      className="toggle-switch__input"
                      checked={autoRenewal}
                      onChange={(e) => dispatch({ type: 'SET_AUTO_RENEWAL', payload: e.target.checked })}
                    />
                    <span className="toggle-switch__track" aria-hidden="true">
                      <span className="toggle-switch__thumb" />
                    </span>
                  </label>
                </div>
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
