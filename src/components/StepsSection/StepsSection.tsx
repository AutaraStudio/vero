'use client';

import Button from '@/components/ui/Button';
import StickyTabs from '@/components/StickyTabs';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import './StepsSection.css';

const THEMES = ['brand-purple', 'brand-blue', 'brand-green'] as const;

interface Step {
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}

const DEFAULT_STEPS: Step[] = [
  {
    title: 'Choose your roles',
    body: 'Browse 10 job families and select the roles you\u2019re hiring for. Each comes with a ready-to-go package of science-backed assessments, built around the specific traits, values and strengths that matter for that role. No configuration required.',
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
  heading?: string;
  intro?: string;
  steps?: Step[];
}

export default function StepsSection({ heading, intro, steps }: StepsSectionProps) {
  const resolvedSteps = steps ?? DEFAULT_STEPS;
  const labelRef = useFadeUp({ delay: 0, duration: 0.5, y: 16 });
  const headingRef = useTextReveal({ delay: 0.1 });
  const introRef = useFadeUp({ delay: 0.2, duration: 0.6, y: 16 });

  const tabs = resolvedSteps.map((step, index) => ({
    theme: THEMES[index % THEMES.length],
    label: `Step ${index + 1}: ${step.title}`,
    children: (
      <>
        <div className="sticky-tab__text stack--lg">
          <div className="stack--md">
            <span className="text-label--sm color--brand">Step {index + 1} of {resolvedSteps.length}</span>
            <h4 className="text-h4 color--primary">{step.title}</h4>
            <p className="text-body--md leading--relaxed color--secondary">{step.body}</p>
          </div>
          <Button variant="primary" size="md" href={step.ctaHref}>
            {step.ctaLabel}
          </Button>
        </div>

        <div className="sticky-tab__image">
          <div className="sticky-tab__image-placeholder" />
        </div>
      </>
    ),
  }));

  return (
    <section className="steps-section section">
      <div className="container">
        <div className="steps-section__header bordered-section stack--md pad--inset-lg">
          <span ref={labelRef as React.RefObject<HTMLSpanElement>} className="section-label">How it works</span>
          <h2 ref={headingRef as React.RefObject<HTMLHeadingElement>} className="section-heading">{heading ?? 'Getting started is straightforward'}</h2>
          <p ref={introRef as React.RefObject<HTMLParagraphElement>} className="section-intro text-body--lg leading--snug">
            {intro ?? 'Getting started with Vero Assess is straightforward. Here\u2019s what to expect.'}
          </p>
        </div>
      </div>

      <StickyTabs tabs={tabs} />
    </section>
  );
}
