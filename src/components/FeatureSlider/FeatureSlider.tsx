'use client';

import { useRef, useEffect } from 'react';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import { initGSAPSlider } from './sliderAnimations';
import './FeatureSlider.css';

const usps = [
  {
    title: 'Skills-based assessments',
    body: 'Designed using the latest academic research, Vero Assess includes trait-level validated personality tests, situational judgment tests, aptitude assessments and values-based assessments.',
  },
  {
    title: 'Tailored to specific roles',
    body: 'Choose from 10 job families, target specific roles within them and plug a package of ready-to-go and relevant assessments into your process.',
  },
  {
    title: 'Integrated into your systems',
    body: 'Compatible with individual tech architecture and capable of integrating with ATS software, Vero Assess can be implemented quickly and cost effectively.',
  },
  {
    title: 'Secure, compliant, accessible',
    body: 'Vero Assess meets the highest standards including ISO27001, ISO9001, Cyber Essentials Plus Certified and WCAG 2.2, keeping data safe and giving everyone the opportunity to perform.',
  },
  {
    title: 'In-depth reporting',
    body: 'A simple dashboard gives assessors an at-a-glance view of each candidate\u2019s progress including a percentage best-fit score, while individual profiles provide detailed performance data.',
  },
  {
    title: 'Powered by Tazio',
    body: 'Based on the same tech as our recruitment and career development platform, Vero Assess offers candidates and assessors dedicated portals, built for ease of use and accessibility.',
  },
  {
    title: 'Shaped around your needs',
    body: 'Buy a package that meets your demands, from smaller one-off campaigns to annual high volume recruitment campaigns across multiple roles.',
  },
];

export default function FeatureSlider() {
  const rootRef = useRef<HTMLDivElement>(null);

  const labelRef = useFadeUp({ delay: 0, duration: 0.5, y: 16 });
  const headingRef = useTextReveal({ delay: 0.1 });
  const introRef = useFadeUp({ delay: 0.2, duration: 0.6, y: 16 });

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const cleanup = initGSAPSlider(el);
    return cleanup;
  }, []);

  return (
    <section className="feature-slider">
      <div className="container">
        <div className="feature-slider__header stack--md">
          <span ref={labelRef as React.RefObject<HTMLSpanElement>} className="section-label">Why Vero Assess</span>
          <h2 ref={headingRef as React.RefObject<HTMLHeadingElement>} className="section-heading">Better experiences. Better hires.</h2>
          <p ref={introRef as React.RefObject<HTMLParagraphElement>} className="section-intro text-body--lg leading--snug">
            Vero Assess puts a safe, accessible and scientifically-backed
            solution at the heart of your recruitment campaign.
          </p>
        </div>
      </div>

      <div
        ref={rootRef}
        aria-label="Features"
        data-gsap-slider-init=""
        role="region"
        aria-roledescription="carousel"
        className="gsap-slider"
      >
        <div data-gsap-slider-collection="" className="gsap-slider__collection">
          <div data-gsap-slider-list="" className="gsap-slider__list">
            {usps.map((usp, i) => (
              <div key={i} data-gsap-slider-item="" className="gsap-slider__item">
                <div className="slider-card">
                  <div className="slider-card__image" />
                  <div className="slider-card__content stack--sm">
                    <h3 className="text-h5 color--primary">{usp.title}</h3>
                    <p className="text-body--sm color--secondary leading--relaxed">{usp.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div data-gsap-slider-controls="" className="gsap-slider__controls flex gap--sm">
          <button data-gsap-slider-control="prev" className="gsap-slider__control">Prev</button>
          <button data-gsap-slider-control="next" className="gsap-slider__control">Next</button>
        </div>
      </div>
    </section>
  );
}
