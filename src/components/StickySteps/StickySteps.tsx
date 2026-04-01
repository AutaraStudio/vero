'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import './StickySteps.css';

export interface StickyStep {
  eyebrow: string;
  headline: string;
  body: string;
  imageSrc?: string;
  imageAlt?: string;
  visual?: React.ReactNode;
}

interface StickyStepsProps {
  steps: StickyStep[];
  theme?: string;
  accentSwatch?: string;
}

export function StickySteps({
  steps,
  theme = 'dark-purple',
  accentSwatch = 'var(--swatch--purple-500)',
}: StickyStepsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const anchorRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    function updateActive() {
      const viewportCentre = window.innerHeight / 2;
      let closestIndex = 0;
      let closestDistance = Infinity;

      anchorRefs.current.forEach((anchor, index) => {
        if (!anchor) return;
        const rect = anchor.getBoundingClientRect();
        const anchorCentre = rect.top + rect.height / 2;
        const distance = Math.abs(viewportCentre - anchorCentre);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);
    }

    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive);
    requestAnimationFrame(updateActive);

    return () => {
      window.removeEventListener('scroll', updateActive);
      window.removeEventListener('resize', updateActive);
    };
  }, []);

  return (
    <section
      className="sticky-steps"
      data-theme={theme}
      style={{ '--sticky-steps-accent': accentSwatch } as React.CSSProperties}
    >
      <div className="sticky-steps__container">
        <div className="sticky-steps__list">
          {steps.map((step, index) => {
            const isActive = index === activeIndex;
            const isBefore = index < activeIndex;

            return (
              <div
                key={index}
                className="sticky-steps__item"
                data-sticky-steps-status={isActive ? 'active' : isBefore ? 'before' : 'after'}
              >
                <div ref={(el) => { anchorRefs.current[index] = el; }} className="sticky-steps__text">
                  <span className="sticky-steps__eyebrow">{step.eyebrow}</span>
                  <h2 className="sticky-steps__headline">{step.headline}</h2>
                  <p className="sticky-steps__body">{step.body}</p>
                </div>

                <div className="sticky-steps__media">
                  <div className="sticky-steps__sticky">
                    <div className="sticky-steps__visual">
                      {step.visual ? (
                        step.visual
                      ) : step.imageSrc ? (
                        <Image src={step.imageSrc} alt={step.imageAlt ?? ''} fill className="sticky-steps__image" />
                      ) : (
                        <div className="sticky-steps__placeholder" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
