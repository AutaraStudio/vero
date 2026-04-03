'use client';

import './category.css';
import { StickySteps, type StickyStep } from '@/components/StickySteps/StickySteps';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import type { ThemeVariant } from '@/lib/theme';

interface InActionSectionProps {
  sectionHeading: string;
  sectionSubheading: string;
  assessmentsHeading: string;
  assessmentsBody: string;
  portalHeading: string;
  portalBody: string;
  interviewHeading: string;
  interviewBody: string;
  theme?: ThemeVariant;
}

export default function InActionSection({
  sectionHeading,
  sectionSubheading,
  assessmentsHeading,
  assessmentsBody,
  portalHeading,
  portalBody,
  interviewHeading,
  interviewBody,
  theme = 'brand-purple',
}: InActionSectionProps) {
  const labelRef   = useFadeUp({ delay: 0, duration: 0.5, y: 16 });
  const headingRef = useTextReveal();
  const bodyRef    = useFadeUp({ delay: 0.2, duration: 0.6, y: 16 });

  const steps: StickyStep[] = [
    {
      eyebrow: 'Assessments',
      headline: assessmentsHeading,
      body: assessmentsBody,
    },
    {
      eyebrow: 'Assessors portal',
      headline: portalHeading,
      body: portalBody,
    },
    {
      eyebrow: 'Interview frameworks',
      headline: interviewHeading,
      body: interviewBody,
    },
  ];

  return (
    <div>
      <section data-theme={theme} className="in-action-header border--bottom-subtle">
        <div className="container">
          <div className="in-action-header__inner">
            <span
              ref={labelRef as React.RefObject<HTMLSpanElement>}
              data-animate=""
              className="section-label"
            >
              Vero Assess in action
            </span>

            <h2
              ref={headingRef as React.RefObject<HTMLHeadingElement>}
              data-animate=""
              className="text-h2 text-balance"
            >
              {sectionHeading}
            </h2>

            <p
              ref={bodyRef as React.RefObject<HTMLParagraphElement>}
              data-animate=""
              className="text-body--lg leading--snug max-ch-50 color--secondary"
            >
              {sectionSubheading}
            </p>
          </div>
        </div>
      </section>

      <StickySteps
        steps={steps}
        theme={theme}
        accentSwatch="var(--swatch--purple-500)"
      />
    </div>
  );
}
