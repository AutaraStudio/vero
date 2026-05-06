'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { useBasket } from '@/store/basketStore';
import { TIER_DATA, getNudgeContent, getTierPrice } from '@/lib/tierRecommendation';
import UpsellNudge from '@/app/(site)/get-started/components/UpsellNudge';
import './role-roster-summary-bar.css';

/**
 * Section-scoped sticky summary bar shown at the bottom of the role-roster
 * grid on every assessment-category page. It's `position: sticky` inside
 * the role-grid section, so it floats at the bottom of the viewport while
 * the section is on screen and scrolls away with the section as the user
 * moves past it — never sticks for the whole page.
 *
 * Mirrors the behaviour of the basket-mobile-bar inside `/get-started`:
 * shows count + recommended-tier label + price hint, View basket / Continue
 * actions, and triggers the same UpsellNudge popup before sending the user
 * to the next checkout step.
 */
export default function RoleRosterSummaryBar() {
  const router = useRouter();
  const { state, dispatch } = useBasket();
  const { selectedRoles, recommendedTier, paymentFrequency, nudgeShown } = state;
  const [nudgeVisible, setNudgeVisible] = useState(false);

  if (selectedRoles.length === 0) return null;

  const tierInfo = recommendedTier ? TIER_DATA[recommendedTier] : null;
  const price = tierInfo ? getTierPrice(tierInfo, paymentFrequency) : null;

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

  return (
    <>
      <div className="role-roster-summary-bar" role="region" aria-label="Selected roles summary">
        <div className="role-roster-summary-bar__inner">
          <div className="role-roster-summary-bar__info">
            <div className="role-roster-summary-bar__info-row">
              <span className="text-body--md font--medium color--primary">
                {selectedRoles.length} role{selectedRoles.length !== 1 ? 's' : ''} selected
              </span>
              {tierInfo && (
                <span className="section-label">{tierInfo.name}</span>
              )}
            </div>
            {tierInfo && price && (
              <span className="text-body--xs color--tertiary">
                {price.price} · {price.priceNote}
              </span>
            )}
          </div>
          <div className="role-roster-summary-bar__actions">
            <Button variant="primary" size="sm" onClick={handleContinue}>
              {recommendedTier === 'bespoke' ? 'Discuss requirements →' : 'Continue →'}
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
