'use client';

import Button from '@/components/ui/Button';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import './HowItWorks.css';

const steps = [
  {
    number: 1,
    title: 'Choose your roles',
    body: 'Browse 10 job families and select the roles you\u2019re hiring for. Each comes with a ready-to-go package of science-backed assessments, built around the specific traits, values and strengths that matter for that role. No configuration required.',
    cta: 'Browse job families',
    href: '/assessments',
    theme: 'brand-purple' as const,
  },
  {
    number: 2,
    title: 'Assess your candidates',
    body: 'Send assessments directly to candidates and let Vero Assess do the work. Candidates complete their assessments online, at their own pace, through a dedicated portal built for accessibility and ease of use. You can go live within 48 hours of purchase.',
    cta: 'See how it works',
    href: '/how-it-works',
    theme: 'brand-blue' as const,
  },
  {
    number: 3,
    title: 'Make the right hire',
    body: 'Review results in your assessor dashboard. Each candidate gets a percentage best-fit score alongside detailed performance data across every dimension. Pair that with the role-specific interview frameworks provided, and you have everything you need to make a confident, objective hiring decision.',
    cta: 'Get started',
    href: '/get-started',
    theme: 'brand-green' as const,
  },
];

export default function HowItWorks() {
  // Scroll-triggered animations for header
  const labelRef = useFadeUp({ delay: 0, duration: 0.5, y: 16 });
  const headingRef = useTextReveal({ delay: 0.1 });
  const introRef = useFadeUp({ delay: 0.2, duration: 0.6, y: 16 });

  return (
    <section className="how-it-works section">
      {/* Section header */}
      <div className="container">
        <div className="how-it-works__header bordered-section stack--md pad--inset-lg">
          <span ref={labelRef as React.RefObject<HTMLSpanElement>} className="section-label">How it works</span>
          <h2 ref={headingRef as React.RefObject<HTMLHeadingElement>} className="section-heading">Getting started is straightforward</h2>
          <p ref={introRef as React.RefObject<HTMLParagraphElement>} className="section-intro text-body--lg leading--snug">
            Getting started with Vero Assess is straightforward. Here&rsquo;s what to expect.
          </p>
        </div>
      </div>

      {/* Sticky tab group */}
      <div className="sticky-tab-group">
        <div className="sticky-tab-group__nav-bg" />

        {steps.map((step) => (
          <section key={step.number} className="sticky-tab" data-theme={step.theme}>
            {/* Sticky heading bar */}
            <div className="sticky-tab__sticky">
              <div className="sticky-tab__inner border--top border--bottom">
                <div className="container">
                  <div className="sticky-tab__content flex--between">
                    <h3 className="sticky-tab__title text-h3 color--primary">
                      Step {step.number}: {step.title}
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Step body */}
            <div className="container">
              <div className="sticky-tab__body bordered-section">
                <div className="sticky-tab__body-inner">
                  {/* Left: text */}
                  <div className="sticky-tab__text stack--lg">
                    <div className="stack--md">
                      <span className="text-label--sm color--brand">Step {step.number} of 3</span>
                      <h4 className="text-h4 color--primary">{step.title}</h4>
                      <p className="text-body--md leading--relaxed color--secondary">{step.body}</p>
                    </div>
                    <Button variant="primary" size="md" href={step.href}>
                      {step.cta}
                    </Button>
                  </div>

                  {/* Right: placeholder image */}
                  <div className="sticky-tab__image">
                    <div className="sticky-tab__image-placeholder" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
