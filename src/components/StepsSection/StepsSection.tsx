'use client';

import { StickySteps, type StickyStep } from '@/components/StickySteps/StickySteps';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import type { ThemeVariant } from '@/lib/theme';
import './StepsSection.css';

interface Step {
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
}

const DEFAULT_STEPS: Step[] = [
  {
    title: 'Choose your roles',
    body: 'Browse 10 job families and select the roles you’re hiring for. Each comes with a ready-to-go package of science-backed assessments, built around the specific traits, values and strengths that matter for that role. No configuration required.',
    ctaLabel: 'Browse job families',
    ctaHref: '/assessments',
  },
  {
    title: 'Assess your candidates',
    body: 'Send assessments directly to candidates and let Vero Assess do the work. Candidates complete their assessments online, at their own pace, through a dedicated portal built for accessibility and ease of use. You can go live within 48 hours of purchase.',
    ctaLabel: 'See how it works',
    ctaHref: '/how-it-works',
  },
  {
    title: 'Make the right hire',
    body: 'Review results in your assessor dashboard. Each candidate gets a percentage best-fit score alongside detailed performance data across every dimension. Pair that with the role-specific interview frameworks provided, and you have everything you need to make a confident, objective hiring decision.',
    ctaLabel: 'Get started',
    ctaHref: '/get-started',
  },
];

interface StepsSectionProps {
  eyebrow?: string;
  heading?: string;
  intro?: string;
  steps?: Step[];
  theme?: ThemeVariant;
}

export default function StepsSection({
  eyebrow = 'How it works',
  heading,
  intro,
  steps,
  theme = 'brand-purple',
}: StepsSectionProps) {
  const resolvedSteps = steps ?? DEFAULT_STEPS;

  const labelRef   = useFadeUp({ delay: 0,    duration: 0.5, y: 16 });
  const headingRef = useTextReveal({ delay: 0.1 });
  const introRef   = useFadeUp({ delay: 0.2,  duration: 0.6, y: 16 });

  /* Map each Sanity step into the StickySteps shape: each step gets a
     "Step N of M" eyebrow, the title becomes the headline, and any CTA
     is forwarded to the new optional CTA slot inside StickySteps. */
  const stickySteps: StickyStep[] = resolvedSteps.map((step, i) => ({
    eyebrow:  `Step ${i + 1} of ${resolvedSteps.length}`,
    headline: step.title,
    body:     step.body,
    ctaLabel: step.ctaLabel,
    ctaHref:  step.ctaHref,
  }));

  return (
    <section className="steps-section" data-theme={theme}>
      <div className="container">
        <div className="steps-section__header stack--md">
          <span ref={labelRef as React.RefObject<HTMLSpanElement>} className="section-label">
            {eyebrow}
          </span>
          <h2 ref={headingRef as React.RefObject<HTMLHeadingElement>} className="section-heading">
            {heading ?? 'Getting started is straightforward'}
          </h2>
          {intro !== undefined && intro !== '' && (
            <p ref={introRef as React.RefObject<HTMLParagraphElement>} className="section-intro text-body--lg leading--snug">
              {intro}
            </p>
          )}
        </div>
      </div>

      <StickySteps steps={stickySteps} theme={theme} />
    </section>
  );
}
