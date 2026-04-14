'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useBasket } from '@/store/basketStore';
import { TIER_DATA, getTierPrice, getNudgeContent } from '@/lib/tierRecommendation';
import { gsap } from '@/lib/gsap';
import Button from '@/components/ui/Button';
import FixedBar from '@/components/ui/FixedBar';
import UpsellNudge from './UpsellNudge';
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

  const tierInfo = recommendedTier ? TIER_DATA[recommendedTier] : null;
  const isStep1 = pathname === '/get-started';

  useEffect(() => {
    if (!barRef.current || !tierInfo) return;
    gsap.from(barRef.current, { y: '100%', duration: 0.45, ease: 'power3.out', delay: 0.1 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!tierInfo]);

  const HIDDEN_PATHS = ['/get-started/confirmation', '/get-started/bespoke', '/get-started/payment'];
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
    ? { label: 'Discuss your requirements →', onClick: () => router.push('/get-started/bespoke') }
    : { label: 'Continue to checkout', onClick: handleStep1Continue };

  const ctaMap: Record<string, { label: string; href?: string; formId?: string; onClick?: () => void }> = {
    '/get-started':          step1Cta,
    '/get-started/details':  { label: 'Continue to contract →', formId: 'details-form' },
    '/get-started/contract': { label: 'Continue to payment →',  href: '/get-started/payment' },
    '/get-started/payment':  { label: 'Complete order →',       href: '/get-started/confirmation' },
  };

  const cta = ctaMap[pathname] ?? { label: 'Continue →', href: '/get-started/details' };

  return (
    <>
      <div ref={barRef}>
        <FixedBar theme={theme}>

          {/* Left — tier name + billing frequency label */}
          <div className="plan-bar__left">
            <span className="plan-bar__tier-name">{tierInfo.name}</span>
            {tierInfo.hasFrequencyToggle && (
              <span className="plan-bar__freq-label text-body--xs color--tertiary">
                {paymentFrequency === 'annual' ? 'Billed annually' : 'Billed monthly'}
              </span>
            )}
          </div>

          {/* Divider */}
          <span className="divider--vertical plan-bar__hide-tablet" aria-hidden="true" />

          {/* Centre — price + limits */}
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
          <Button
            variant="primary"
            size="md"
            href={cta.href}
            onClick={cta.onClick}
            {...(cta.formId ? { type: 'submit' as const, form: cta.formId } : {})}
          >
            {cta.label}
          </Button>

        </FixedBar>
      </div>

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
