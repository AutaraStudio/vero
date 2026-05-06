'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBasket } from '@/store/basketStore';
import { TIER_DATA, getTierPrice, getNudgeContent } from '@/lib/tierRecommendation';
import { gsap } from '@/lib/gsap';
import Button from '@/components/ui/Button';
import UpsellNudge from '@/app/(site)/get-started/components/UpsellNudge';
import '@/app/(site)/get-started/components/plan-bar.css';
import './role-roster-summary-bar.css';

/**
 * Section-scoped variant of the get-started PlanBar shown on each
 * assessment-category page. Visually matches the checkout-flow
 * bar (same plan-bar layout — tier name + price + CTA) so the user
 * gets a consistent "where you are with your basket" anchor across
 * the buying journey.
 *
 * The bar is `position: sticky` rendered inside the role-grid
 * section, so it floats at the bottom of the viewport while the
 * section is on screen and scrolls away with the section as the
 * user moves past — pure CSS, no JS observer needed.
 */
export default function RoleRosterSummaryBar() {
  const router = useRouter();
  const { state, dispatch } = useBasket();
  const { selectedRoles, recommendedTier, paymentFrequency, nudgeShown } = state;

  const [nudgeVisible, setNudgeVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  const tierInfo = recommendedTier ? TIER_DATA[recommendedTier] : null;
  const visible = selectedRoles.length > 0 && !!tierInfo;

  /* Slide-in when the bar first becomes visible — mirrors PlanBar. */
  useEffect(() => {
    if (!visible || !barRef.current) return;
    gsap.fromTo(
      barRef.current,
      { y: '100%' },
      { y: 0, duration: 0.45, ease: 'power3.out', delay: 0.05, clearProps: 'transform' },
    );
  }, [visible]);

  if (!visible || !tierInfo) return null;

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

  const ctaLabel = recommendedTier === 'bespoke'
    ? 'Discuss your requirements →'
    : 'Continue to checkout';

  return (
    <>
      <div ref={barRef} className="role-roster-summary-bar" data-theme="brand-purple">
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

      {nudgeVisible && recommendedTier && (() => {
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
