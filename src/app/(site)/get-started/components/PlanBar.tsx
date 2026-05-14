'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useBasket } from '@/store/basketStore';
import { TIER_DATA, getTierPrice, getNudgeContent } from '@/lib/tierRecommendation';
import { gsap } from '@/lib/gsap';
import Button from '@/components/ui/Button';
import FixedBar from '@/components/ui/FixedBar';
import UpsellNudge from './UpsellNudge';
import BasketContent from './BasketContent';
import { usePlanBarSubmitDisabled, usePlanBarSubmitAction, usePlanBarSubmitLabel } from './planBarSubmit';
import type { ThemeVariant } from '@/lib/theme';
import './plan-bar.css';

interface PlanBarProps {
  theme: ThemeVariant;
}

export default function PlanBar({ theme }: PlanBarProps) {
  const router = useRouter();
  const { state, dispatch } = useBasket();
  const { selectedRoles, recommendedTier, paymentFrequency, nudgeShown } = state;
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const [nudgeVisible, setNudgeVisible] = useState(false);
  /* Mobile only — the desktop sidebar is hidden ≤991px and replaced by a
     slide-over drawer the user opens from the summary strip in the bar. */
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* Pages that own a form (currently /get-started/details) publish their
     "required-fields-filled" state via this signal so the bar's CTA
     mirrors the inline submit button — disabled when the form isn't
     ready, primary purple when it is. Other pages don't publish, so the
     signal resolves to false (enabled), which is the existing behaviour. */
  const submitDisabled = usePlanBarSubmitDisabled();
  const publishedAction = usePlanBarSubmitAction();
  const publishedLabel = usePlanBarSubmitLabel();

  const tierInfo = recommendedTier ? TIER_DATA[recommendedTier] : null;
  const isStep1 = pathname === '/get-started';

  useEffect(() => {
    if (!barRef.current || !tierInfo) return;
    /* fromTo (not from) — explicit start + end states so the bar always
       lands at y: 0 even if the animation gets interrupted or the dep
       array doesn't re-fire across navigations. Was disappearing on
       desktop because `from` could leave the bar stuck at y: 100%. */
    gsap.fromTo(
      barRef.current,
      { y: '100%' },
      { y: 0, duration: 0.45, ease: 'power3.out', delay: 0.1, clearProps: 'transform' },
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!tierInfo]);

  /* Drawer — lock body scroll while open + close on Escape. */
  useEffect(() => {
    if (!drawerOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [drawerOpen]);

  /* Close the drawer on navigation between steps. */
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const HIDDEN_PATHS = ['/get-started/confirmation', '/get-started/bespoke'];
  if (!tierInfo || selectedRoles.length === 0 || HIDDEN_PATHS.includes(pathname)) return null;

  const { price, priceNote } = getTierPrice(tierInfo, paymentFrequency);

  const handleStep1Continue = () => {
    if (!nudgeShown && recommendedTier) {
      const content = getNudgeContent(recommendedTier, selectedRoles.length);
      if (content) {
        setNudgeVisible(true);
        return;
      }
    }
    router.push('/get-started/details');
  };

  const step1Cta = recommendedTier === 'bespoke'
    ? { label: 'Discuss your requirements', onClick: () => router.push('/get-started/bespoke') }
    : { label: 'Continue to checkout', onClick: handleStep1Continue };

  const handleContractContinue = () => {
    dispatch({ type: 'ACCEPT_CONTRACT' });
    router.push('/get-started/payment');
  };

  const ctaMap: Record<string, { label: string; href?: string; formId?: string; onClick?: () => void }> = {
    '/get-started':              step1Cta,
    '/get-started/details':      { label: 'Continue to portal setup', formId: 'details-form' },
    '/get-started/portal-setup': { label: 'Continue to contract',     formId: 'portal-setup-form' },
    '/get-started/contract':     { label: 'Continue to payment',      onClick: handleContractContinue },
    '/get-started/payment':      { label: 'Complete order',           href: '/get-started/confirmation' },
  };

  const cta = ctaMap[pathname] ?? { label: 'Continue', href: '/get-started/details' };

  /* Back button — moved out of each page into the sticky bar. /get-started
     is the first step so no back button there; the rest point to the
     previous step's URL. */
  const backMap: Record<string, { label: string; href: string }> = {
    '/get-started/details':      { label: 'Back to roles',        href: '/get-started' },
    '/get-started/portal-setup': { label: 'Back to details',      href: '/get-started/details' },
    '/get-started/contract':     { label: 'Back to portal setup', href: '/get-started/portal-setup' },
    '/get-started/payment':      { label: 'Back to terms',        href: '/get-started/contract' },
  };
  const back = backMap[pathname];

  return (
    <>
      {/* On /get-started the role picker owns its own basket-mobile-bar at
          the bottom of the viewport on ≤768px. Hide PlanBar on that path
          at the same breakpoint so the two don't stack. */}
      <div ref={barRef} className={isStep1 ? 'plan-bar--hide-mobile' : undefined}>
        <FixedBar theme={theme} className="plan-bar-fixed">

          {/* ── Mobile-only: tappable summary strip — opens the drawer ──
              The desktop sidebar is hidden ≤991px, so this is how the
              user reaches the full basket / billing toggle / price. */}
          <button
            type="button"
            className="plan-bar__summary"
            onClick={() => setDrawerOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
          >
            <span className="plan-bar__summary-text">
              <span className="plan-bar__tier-name">{tierInfo.name}</span>
              <span className="plan-bar__summary-price">
                {price}
                <span className="text-body--xs color--tertiary">{' '}{priceNote}</span>
              </span>
            </span>
            <span className="plan-bar__summary-cue text-body--xs">
              View order
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2.5 7.5L6 4l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>

          {/* ── Desktop-only: inline tier + price ── */}
          <div className="plan-bar__desktop">
            <div className="plan-bar__left">
              <span className="plan-bar__tier-name">{tierInfo.name}</span>
              {tierInfo.hasFrequencyToggle && (
                <span className="plan-bar__freq-label text-body--xs color--tertiary">
                  {paymentFrequency === 'annual' ? 'Billed annually' : 'Billed monthly'}
                </span>
              )}
            </div>

            <span className="divider--vertical plan-bar__hide-tablet" aria-hidden="true" />

            <div className="plan-bar__centre">
              <div className="plan-bar__price-row">
                <span className="plan-bar__price text-h4 color--primary">{price}</span>
                <span className="text-body--xs color--tertiary">{priceNote}</span>
              </div>
              <div className="plan-bar__limits-row">
                <span className="text-body--xs color--secondary">{tierInfo.candidateLimit}</span>
                <span className="plan-bar__dot" aria-hidden="true" />
                <span className="text-body--xs color--secondary">{tierInfo.roleLimit}</span>
              </div>
            </div>
          </div>

          {/* ── Back (optional) + Continue. On mobile this row sits below
              the summary strip and spaces the two buttons apart. When a
              page has published an action (e.g. /payment's submit
              handler), the CTA runs that instead of its default
              navigation, and the page can override the label too. ── */}
          <div className="plan-bar__actions">
            {back && (
              <Button variant="secondary" size="md" href={back.href}>
                {back.label}
              </Button>
            )}
            <Button
              variant="primary"
              size="md"
              href={publishedAction ? undefined : cta.href}
              onClick={publishedAction ?? cta.onClick}
              disabled={submitDisabled}
              {...(!publishedAction && cta.formId ? { type: 'submit' as const, form: cta.formId } : {})}
            >
              {publishedLabel ?? cta.label}
            </Button>
          </div>

        </FixedBar>
      </div>

      {/* ── Mobile basket drawer — slides up over the page ── */}
      {drawerOpen && (
        <div
          className="basket-drawer plan-bar__drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Order summary"
        >
          <div className="basket-drawer__backdrop" onClick={() => setDrawerOpen(false)} />
          <div className="basket-drawer__panel">
            <button
              type="button"
              className="basket-drawer__close"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close order summary"
            >
              ×
            </button>
            <BasketContent mode="review" />
          </div>
        </div>
      )}

      {nudgeVisible && recommendedTier && isStep1 && (() => {
        const content = getNudgeContent(recommendedTier, selectedRoles.length);
        if (!content) return null;
        return (
          <UpsellNudge
            content={content}
            onAddMore={() => {
              dispatch({ type: 'SET_NUDGE_SHOWN' });
              setNudgeVisible(false);
            }}
            onContinue={() => {
              dispatch({ type: 'SET_NUDGE_SHOWN' });
              setNudgeVisible(false);
              router.push('/get-started/details');
            }}
          />
        );
      })()}
    </>
  );
}
