'use client';

import { useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap';
import Button from '@/components/ui/Button';
import type { NudgeContent } from '@/lib/tierRecommendation';
import './upsell-nudge.css';

interface UpsellNudgeProps {
  content: NudgeContent;
  onAddMore: () => void;
  onContinue: () => void;
}

export default function UpsellNudge({ content, onAddMore, onContinue }: UpsellNudgeProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!backdropRef.current || !cardRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(backdropRef.current, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.out',
      });
      gsap.from(cardRef.current, {
        opacity: 0,
        y: 20,
        scale: 0.96,
        duration: 0.35,
        ease: 'power3.out',
        delay: 0.05,
      });
    });
    return () => ctx.revert();
  }, []);

  const dismiss = (action: 'addMore' | 'continue') => {
    if (!backdropRef.current || !cardRef.current) return;
    gsap.to(cardRef.current, {
      opacity: 0,
      y: 12,
      scale: 0.97,
      duration: 0.2,
      ease: 'power2.in',
    });
    gsap.to(backdropRef.current, {
      opacity: 0,
      duration: 0.2,
      delay: 0.05,
      ease: 'power2.in',
      onComplete: () => {
        if (action === 'addMore') onAddMore();
        else onContinue();
      },
    });
  };

  const isUpgrade = content.type === 'upgrade';

  return (
    <div
      ref={backdropRef}
      className="nudge-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nudge-headline"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss('addMore');
      }}
    >
      <div ref={cardRef} className="nudge-card">

        {/* Icon */}
        <div className="nudge-icon" aria-hidden="true">
          {isUpgrade ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="nudge-content">
          <h2 id="nudge-headline" className="text-h4 color--primary">
            {content.headline}
          </h2>
          <p className="text-body--sm color--secondary nudge-body">
            {content.body}
          </p>
        </div>

        {/* Actions */}
        <div className="nudge-actions">
          <Button variant="primary" size="md" onClick={() => dismiss('addMore')}>
            {content.primaryLabel}
          </Button>
          <button
            className="nudge-secondary-btn text-body--sm color--brand"
            onClick={() => dismiss('continue')}
            type="button"
          >
            {content.secondaryLabel}
          </button>
        </div>

      </div>
    </div>
  );
}
