'use client';

import Button from '@/components/ui/Button';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import './Hero.css';

export default function Hero() {
  // On-load animations (no scroll trigger)
  const badgeRef = useFadeUp({ scroll: false, delay: 0.1, duration: 0.5, y: 16 });
  const titleRef = useTextReveal({ scroll: false, delay: 0.3 });
  const introRef = useFadeUp({ scroll: false, delay: 0.7, duration: 0.6, y: 16 });
  const ctaRef = useFadeUp({ scroll: false, delay: 0.9, duration: 0.5, y: 16 });

  // Scroll-triggered for the visual area
  const visualRef = useFadeUp({ delay: 0, duration: 0.8, y: 32 });

  return (
    <section className="hero section--flush">
      <div className="container">

        {/* ── Upper: centred text block ── */}
        <div className="bordered-section hero__header">
          <div className="hero__header-inner">
            <span ref={badgeRef as React.RefObject<HTMLSpanElement>} className="hero__badge text-label--sm">Vero Assess</span>

            <h1 ref={titleRef as React.RefObject<HTMLHeadingElement>} className="hero__title text-h1 text-balance">
              Identify authentic talent.
              <br />
              Make strategic hiring decisions.
            </h1>

            <p ref={introRef as React.RefObject<HTMLParagraphElement>} className="hero__intro text-body--lg leading--snug text-centre max-ch-55 mx-auto">
              Evaluate applicants in depth and at speed. Vero Assess reduces
              workloads, enhances recruitment and delivers the talent your
              organisation needs.
            </p>

            <div ref={ctaRef as React.RefObject<HTMLDivElement>} className="hero__cta">
              <Button variant="cta" size="lg" href="/get-started">
                Get started
              </Button>
            </div>
          </div>
        </div>

        {/* ── Lower: visual area ── */}
        <div ref={visualRef as React.RefObject<HTMLDivElement>} className="bordered-section hero__visual">
          {/* Floating tags */}
          <div className="hero__tag hero__tag--danger" aria-hidden="true">
            <span className="hero__tag-icon hero__tag-icon--x" />
            <span className="hero__tag-text text-label--sm">OFAC hits found</span>
          </div>

          <div className="hero__tag hero__tag--success hero__tag--left" aria-hidden="true">
            <span className="hero__tag-icon hero__tag-icon--check" />
            <span className="hero__tag-text text-label--sm">Enhanced background check</span>
          </div>

          <div className="hero__tag hero__tag--success hero__tag--right" aria-hidden="true">
            <span className="hero__tag-icon hero__tag-icon--check" />
            <span className="hero__tag-text text-label--sm">2 assessments completed</span>
          </div>

          {/* Placeholder image area */}
          <div className="hero__placeholder" />
        </div>

      </div>
    </section>
  );
}
