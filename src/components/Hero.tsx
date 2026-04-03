'use client';

import Button from '@/components/ui/Button';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import type { ThemeVariant } from '@/lib/theme';
import './Hero.css';

interface HeroProps {
  title?: string;
  intro?: string;
  ctaLabel?: string;
  theme?: ThemeVariant;
}

export default function Hero({ title, intro, ctaLabel, theme = 'brand-purple' }: HeroProps) {
  // On-load animations (no scroll trigger)
  const badgeRef = useFadeUp({ scroll: false, delay: 0.1, duration: 0.5, y: 16 });
  const titleRef = useTextReveal({ scroll: false, delay: 0.3 });
  const introRef = useFadeUp({ scroll: false, delay: 0.7, duration: 0.6, y: 16 });
  const ctaRef = useFadeUp({ scroll: false, delay: 0.9, duration: 0.5, y: 16 });

  // Scroll-triggered for the visual area
  const visualRef = useFadeUp({ delay: 0, duration: 0.8, y: 32 });

  return (
    <section className="hero section--flush" data-theme={theme}>
      <div className="container">

        {/* ── Upper: centred text block ── */}
        <div className="bordered-section hero__header">
          <div className="hero__header-inner">
            <span ref={badgeRef as React.RefObject<HTMLSpanElement>} data-animate="" className="section-label">Vero Assess</span>

            <h1 ref={titleRef as React.RefObject<HTMLHeadingElement>} data-animate="" className="hero__title text-h1 text-balance max-ch-40">
              {title ?? <>Identify authentic talent.<br />Make strategic hiring decisions.</>}
            </h1>

            <p ref={introRef as React.RefObject<HTMLParagraphElement>} data-animate="" className="hero__intro text-body--lg leading--snug text-centre max-ch-55 mx-auto">
              {intro ?? 'Evaluate applicants in depth and at speed. Vero Assess reduces workloads, enhances recruitment and delivers the talent your organisation needs.'}
            </p>

            <div ref={ctaRef as React.RefObject<HTMLDivElement>} data-animate="" className="hero__cta">
              <Button variant="cta" size="lg" href="/get-started">
                {ctaLabel ?? 'Get started'}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Lower: visual area ── */}
        <div ref={visualRef as React.RefObject<HTMLDivElement>} className="bordered-section hero__visual">
          {/* Floating tags */}
          <div className="hero__tag hero__tag--success hero__tag--pos-1 hero__tag--float-1" aria-hidden="true">
            <span className="hero__tag-icon hero__tag-icon--check" />
            <span className="hero__tag-text text-label--sm">3 assessments completed</span>
          </div>

          <div className="hero__tag hero__tag--danger hero__tag--pos-2 hero__tag--float-2" aria-hidden="true">
            <span className="hero__tag-icon hero__tag-icon--x" />
            <span className="hero__tag-text text-label--sm">Low cultural fit</span>
          </div>

          <div className="hero__tag hero__tag--success hero__tag--pos-3 hero__tag--float-3" aria-hidden="true">
            <span className="hero__tag-icon hero__tag-icon--check" />
            <span className="hero__tag-text text-label--sm">92% best-fit score</span>
          </div>

          <div className="hero__tag hero__tag--info hero__tag--pos-4 hero__tag--float-4" aria-hidden="true">
            <span className="hero__tag-icon hero__tag-icon--info" />
            <span className="hero__tag-text text-label--sm">248 candidates assessed</span>
          </div>

          <div className="hero__tag hero__tag--success hero__tag--pos-5 hero__tag--float-1" aria-hidden="true">
            <span className="hero__tag-icon hero__tag-icon--check" />
            <span className="hero__tag-text text-label--sm">Interview framework ready</span>
          </div>

          <div className="hero__tag hero__tag--warning hero__tag--pos-6 hero__tag--float-3" aria-hidden="true">
            <span className="hero__tag-icon hero__tag-icon--warning" />
            <span className="hero__tag-text text-label--sm">Review recommended</span>
          </div>

          <div className="hero__tag hero__tag--success hero__tag--pos-7 hero__tag--float-2" aria-hidden="true">
            <span className="hero__tag-icon hero__tag-icon--check" />
            <span className="hero__tag-text text-label--sm">Live in 48 hours</span>
          </div>

          {/* Placeholder image area */}
          <div className="hero__placeholder" />
        </div>

      </div>
    </section>
  );
}
