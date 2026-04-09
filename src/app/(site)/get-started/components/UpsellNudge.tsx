'use client';

import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  return createPortal(
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

        {/* Visual block */}
        {content.type === 'slots-remaining' && content.maxRoles && (() => {
          const maxDisplay = content.maxRoles <= 10 ? content.maxRoles : 10;
          const filled = content.maxRoles <= 10
            ? (content.selectedCount ?? 0)
            : Math.round(((content.selectedCount ?? 0) / content.maxRoles) * 10);
          return (
            <div className="nudge-capacity">
              <div className="nudge-capacity__header">
                <span className="section-label nudge-capacity__label">{content.tierName}</span>
                <span className="text-body--xs color--tertiary">
                  {content.selectedCount} of {content.maxRoles} roles
                </span>
              </div>
              <div
                className="nudge-capacity__bar"
                role="meter"
                aria-valuenow={content.selectedCount}
                aria-valuemax={content.maxRoles}
                aria-label={`${content.selectedCount} of ${content.maxRoles} role slots used`}
              >
                {Array.from({ length: maxDisplay }).map((_, i) => (
                  <span
                    key={i}
                    className={`nudge-capacity__segment${i < filled ? ' is-filled' : ''}`}
                  />
                ))}
              </div>
            </div>
          );
        })()}

        {content.type === 'upgrade' && (
          <div className="nudge-comparison">
            <div className="nudge-comparison__card">
              <span className="section-label nudge-comparison__label">{content.fromTierName}</span>
              <span className="text-body--xs color--secondary">{content.fromDetail}</span>
            </div>
            <div className="nudge-comparison__arrow" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="nudge-comparison__card is-highlight">
              <span className="section-label nudge-comparison__label">{content.toTierName}</span>
              <span className="text-body--xs color--secondary">{content.toDetail}</span>
            </div>
          </div>
        )}

        {/* Text */}
        <div className="nudge-content">
          <h2 id="nudge-headline" className="text-h4 color--primary">{content.headline}</h2>
          <p className="text-body--sm color--secondary nudge-body">{content.body}</p>
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
    </div>,
    document.body
  );
}
