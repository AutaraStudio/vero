'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useBasket } from '@/store/basketStore';
import { TIER_DATA, getTierPrice, getNudgeContent } from '@/lib/tierRecommendation';
import Button from '@/components/ui/Button';
import UpsellNudge from '@/app/(site)/get-started/components/UpsellNudge';
import '@/app/(site)/get-started/components/plan-bar.css';
import './role-roster-summary-bar.css';

/* Tweakables */
const SHOW_DELAY_MS = 200;       // brief delay before sliding up so the bar
                                  // doesn't pop in the moment a card scrolls past
const HIDE_BOTTOM_RATIO = 0.1;   // hide when section's bottom edge has reached
                                  // 10% from the viewport top (i.e. 90% past)

/**
 * Page-fixed summary bar shown on each assessment-category page. Slides
 * up into view from the bottom when the role-grid section enters the
 * viewport, slides back out once the section has mostly scrolled past.
 *
 * Visually matches the get-started PlanBar (same plan-bar layout —
 * tier name, price, limits, CTA) so the user sees a consistent
 * "where you are with your basket" anchor across the buying journey.
 *
 * Uses a rAF poll on the role-grid section's getBoundingClientRect
 * because the page's Lenis smooth-scroll didn't fire reliable scroll
 * events for IntersectionObserver in earlier attempts.
 */
export default function RoleRosterSummaryBar() {
  const router = useRouter();
  const { state, dispatch } = useBasket();
  const { selectedRoles, recommendedTier, paymentFrequency, nudgeShown } = state;

  const [nudgeVisible, setNudgeVisible] = useState(false);
  const [sectionInView, setSectionInView] = useState(false);
  const [showWithDelay, setShowWithDelay] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const tierInfo = recommendedTier ? TIER_DATA[recommendedTier] : null;
  const hasContent = selectedRoles.length > 0 && !!tierInfo;

  /* Poll the role-grid section's viewport position once per frame. */
  useEffect(() => {
    const target = document.querySelector<HTMLElement>('.role-grid-section');
    if (!target) return;

    let raf = 0;
    let last: boolean | null = null;
    const tick = () => {
      const r = target.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const inView = r.top < vh && r.bottom > vh * HIDE_BOTTOM_RATIO;
      if (inView !== last) {
        last = inView;
        setSectionInView(inView);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* Apply the show-with-delay so the slide-up animation has a beat. */
  useEffect(() => {
    if (!sectionInView || !hasContent) {
      setShowWithDelay(false);
      return;
    }
    const t = window.setTimeout(() => setShowWithDelay(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [sectionInView, hasContent]);

  if (!hasContent || !tierInfo) return null;

  const { price, priceNote } = getTierPrice(tierInfo, paymentFrequency);

  const handleContinue = () => {
    if (recommendedTier === 'bespoke') {
      router.push('/get-started/bespoke');
      return;
    }
    if (!nudgeShown && recommendedTier) {
      const content = getNudgeContent(recommendedTier, selectedRoles.length);
      if (content) {
        setNudgeVisible(true);
        return;
      }
    }
    router.push('/get-started/details');
  };

  /* Popup primary action — "Explore Essential" or "Add more roles".
     On category pages the user is browsing one category, so to actually
     add more roles they need to see the full picker — push them into
     /get-started where every category is visible at once. */
  const handleAddMore = () => {
    dispatch({ type: 'SET_NUDGE_SHOWN' });
    setNudgeVisible(false);
    router.push('/get-started');
  };

  /* Popup secondary action — "Continue with N roles". Skips the role
     picker step and goes straight to the details form. */
  const handleContinueFromNudge = () => {
    dispatch({ type: 'SET_NUDGE_SHOWN' });
    setNudgeVisible(false);
    router.push('/get-started/details');
  };

  const ctaLabel = recommendedTier === 'bespoke'
    ? 'Discuss your requirements →'
    : 'Continue to checkout';

  if (!mounted) return null;

  const bar = (
    <div
      className={`role-roster-summary-bar${showWithDelay ? ' is-visible' : ''}`}
    >
        <div className="container">
          <div className="role-roster-summary-bar__inner">
            {/* Left — tier name + billing label (matches PlanBar) */}
            <div className="plan-bar__left">
              <span className="plan-bar__tier-name">{tierInfo.name}</span>
              {tierInfo.hasFrequencyToggle && (
                <span className="plan-bar__freq-label text-body--xs color--tertiary">
                  {paymentFrequency === 'annual' ? 'Billed annually' : 'Billed monthly'}
                </span>
              )}
            </div>

            <span className="divider--vertical plan-bar__hide-tablet" aria-hidden="true" />

            {/* Centre — price + limits (matches PlanBar) */}
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

            {/* Right — CTA */}
            <Button variant="primary" size="md" onClick={handleContinue}>
              {ctaLabel}
            </Button>
          </div>
        </div>
    </div>
  );

  const nudgeContent =
    nudgeVisible && recommendedTier
      ? getNudgeContent(recommendedTier, selectedRoles.length)
      : null;

  return createPortal(
    <>
      {bar}
      {nudgeContent && (
        <UpsellNudge
          content={nudgeContent}
          onAddMore={handleAddMore}
          onContinue={handleContinueFromNudge}
        />
      )}
    </>,
    document.body,
  );
}
