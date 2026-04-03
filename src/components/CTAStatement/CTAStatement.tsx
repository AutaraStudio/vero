'use client';

// Adapted from: Baselayer — Statement CTA section
// Vero Assess pattern: "CTAStatement"

import { useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import Button from '@/components/ui/Button';
import type { ThemeVariant } from '@/lib/theme';
import './CTAStatement.css';

interface CTAStatementProps {
  statement?: string;
  eyebrow?: string;
  benefits?: string[];
  cta?: { label: string; href: string };
  theme?: ThemeVariant;
}

export default function CTAStatement({
  statement = 'Siloed assessment data gives you fragments, not the full picture of candidate potential.',
  eyebrow = 'with Vero Assess you can',
  benefits = [
    'Assess every candidate consistently, at any volume',
    'Make data-backed hiring decisions with confidence',
    'Reduce time-to-hire without sacrificing quality',
    'Build fairer, more inclusive hiring processes',
  ],
  cta = { label: 'Get started free', href: '/get-started' },
  theme = 'brand-purple',
}: CTAStatementProps) {
  const statementRef = useTextReveal({ delay: 0.1 });
  const eyebrowRef   = useFadeUp({ delay: 0.3, duration: 0.5, y: 12 });
  const featureRef   = useFadeUp({ delay: 0.45, duration: 0.6, y: 24 });
  const ctaRef       = useFadeUp({ delay: 0.6, duration: 0.5, y: 16 });

  const itemsRef  = useRef<(HTMLDivElement | null)[]>([]);
  const currentRef = useRef(0);

  useEffect(() => {
    const items = itemsRef.current.filter(Boolean) as HTMLElement[];
    if (items.length < 2) return;

    // All start below the track except the first
    gsap.set(items, { y: '100%', opacity: 0 });
    gsap.set(items[0], { y: '0%', opacity: 1 });

    const exitDur = 0.4;

    const interval = setInterval(() => {
      const prev = currentRef.current;
      const next = (prev + 1) % items.length;
      currentRef.current = next;

      // Exit — slide up and out
      gsap.to(items[prev], {
        y: '-100%',
        opacity: 0,
        duration: exitDur,
        ease: 'power2.in',
      });

      // Enter — starts only after exit completes
      gsap.fromTo(
        items[next],
        { y: '100%', opacity: 0 },
        { y: '0%', opacity: 1, duration: 0.5, ease: 'vero.out', delay: exitDur },
      );
    }, 2600);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="cta-statement" data-theme={theme}>
      <div className="container">
        <div className="cta-statement__box">

          {/* Header — statement → dividers → eyebrow */}
          <div className="cta-statement__header">
            <h2
              ref={statementRef as React.RefObject<HTMLHeadingElement>}
              data-animate=""
              className="cta-statement__statement text-h2 text-centre max-ch-45"
            >
              {statement}
            </h2>

            <div className="cta-statement__divider" style={{ height: '1.875rem' }} />

            <span
              ref={eyebrowRef as React.RefObject<HTMLSpanElement>}
              data-animate=""
              className="section-label"
            >
              {eyebrow}
            </span>

            <div className="cta-statement__divider" style={{ height: '2.1875rem' }} />
          </div>

          {/* Feature box */}
          <div
            ref={featureRef as React.RefObject<HTMLDivElement>}
            data-animate=""
            className="cta-statement__feature"
          >
            <div className="cta-statement__dot">
              <div className="cta-statement__dot-inner" />
            </div>

            <div className="cta-statement__benefit-row">
              <span className="cta-statement__check" aria-hidden="true">
                <CheckIcon />
              </span>

              <div className="cta-statement__loop">
                {benefits.map((benefit, i) => (
                  <div
                    key={i}
                    ref={(el) => { itemsRef.current[i] = el; }}
                    className="cta-statement__loop-item text-h5"
                  >
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div
            ref={ctaRef as React.RefObject<HTMLDivElement>}
            data-animate=""
            className="cta-statement__cta"
          >
            <Button variant="cta" href={cta.href}>
              {cta.label}
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <path
        d="M3.60209 10.4454L1.05312e-06 14.0337L10.0627 26.5459C10.4479 27.0249 11.1774 27.0244 11.562 26.545L30 3.56306L28.4255 1.98742L13.1243 14.3556C11.7762 15.438 9.81813 15.438 8.46955 14.3556L3.60209 10.4454Z"
        fill="currentColor"
      />
    </svg>
  );
}
