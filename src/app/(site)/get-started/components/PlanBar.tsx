'use client';

import { useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useBasket } from '@/store/basketStore';
import { TIER_DATA } from '@/lib/tierRecommendation';
import { gsap } from '@/lib/gsap';
import Button from '@/components/ui/Button';
import type { ThemeVariant } from '@/lib/theme';
import './plan-bar.css';

interface PlanBarProps {
  theme: ThemeVariant;
}

export default function PlanBar({ theme }: PlanBarProps) {
  const { state } = useBasket();
  const { selectedRoles, recommendedTier } = state;
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);

  const tierInfo = recommendedTier ? TIER_DATA[recommendedTier] : null;

  useEffect(() => {
    if (!barRef.current || !tierInfo) return;
    gsap.from(barRef.current, { y: '100%', duration: 0.45, ease: 'power3.out', delay: 0.1 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!tierInfo]);

  const HIDDEN_PATHS = ['/get-started/confirmation'];
  if (!tierInfo || selectedRoles.length === 0 || HIDDEN_PATHS.includes(pathname)) return null;

  const ctaMap: Record<string, { label: string; href?: string; formId?: string }> = {
    '/get-started':          { label: 'Continue to details →',  href: '/get-started/details' },
    '/get-started/details':  { label: 'Continue to contract →', formId: 'details-form' },
    '/get-started/contract': { label: 'Continue to payment →',  href: '/get-started/payment' },
    '/get-started/payment':  { label: 'Complete order →',       href: '/get-started/confirmation' },
  };

  const cta = ctaMap[pathname] ?? { label: 'Continue →', href: '/get-started/details' };

  return (
    <div ref={barRef} className="plan-bar" data-theme={theme}>
      <div className="container">
        <div className="plan-bar__inner">

          {/* Left — tier name pill */}
          <span className="section-label plan-bar__badge">{tierInfo.name}</span>

          {/* Centre — plan details */}
          <div className="plan-bar__details">
            <span className="plan-bar__price text-h4 color--primary">{tierInfo.price}</span>
            <span className="text-body--xs color--tertiary">{tierInfo.priceNote}</span>
            <span className="plan-bar__divider" aria-hidden="true" />
            <span className="text-body--sm color--secondary plan-bar__limit">{tierInfo.candidateLimit}</span>
            <span className="plan-bar__divider" aria-hidden="true" />
            <span className="text-body--sm color--secondary plan-bar__limit">{tierInfo.roleLimit}</span>
          </div>

          {/* Right — CTA */}
          <Button
            variant="primary"
            size="md"
            href={cta.href}
            {...(cta.formId ? { type: 'submit' as const, form: cta.formId } : {})}
          >
            {cta.label}
          </Button>

        </div>
      </div>
    </div>
  );
}
