'use client';

import { useState, useRef, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import { initGSAPSlider } from './pricingSlider';
import './Pricing.css';

const roleOptions = [
  { value: 'starter', label: '1 role', hint: 'Our Starter package is the right fit for you.' },
  { value: 'essential', label: '2\u20135 roles', hint: 'Our Essential package is the right fit for you.' },
  { value: 'growth', label: '6\u201320 roles', hint: 'Our Growth package is the right fit for you.' },
  { value: 'scale', label: '21\u201350 roles', hint: 'Our Scale package is the right fit for you.' },
  { value: 'bespoke', label: 'Not sure yet', hint: 'Let\u2019s talk. Our team can help you find the right solution.' },
];

const tiers = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'A one-off package of assessments to trial how Vero Assess works for a single role.',
    price: '\u00A33,500',
    priceNote: 'pay in full',
    features: [
      'Up to 250 candidates',
      '1 job role',
      'Available for 12 months or until credits are used',
    ],
    upgradeNote: 'Upgrade from Starter and we\u2019ll take the \u00A33,500 cost off your first subscription.',
    cta: 'Find out more',
    href: '/get-started?tier=starter',
  },
  {
    id: 'essential',
    name: 'Essential',
    description: 'Higher volumes and lower per candidate costs.',
    price: '\u00A39,000',
    priceNote: 'per year \u2014 pay monthly or annually',
    features: [
      'Up to 1,000 candidates',
      'Up to 5 job roles',
    ],
    cta: 'Find out more',
    href: '/get-started?tier=essential',
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'Scale your hiring across multiple roles and higher volumes.',
    price: '\u00A318,000',
    priceNote: 'per year \u2014 pay monthly or annually',
    features: [
      'Up to 2,500 candidates',
      'Up to 20 job roles',
    ],
    cta: 'Find out more',
    href: '/get-started?tier=growth',
  },
  {
    id: 'scale',
    name: 'Scale',
    description: 'Full platform access for high-volume, multi-role hiring.',
    price: '\u00A330,000',
    priceNote: 'per year \u2014 pay monthly or annually',
    features: [
      'Up to 6,000 candidates',
      'Access to all 50 roles',
    ],
    cta: 'Find out more',
    href: '/get-started?tier=scale',
  },
];

function RoleDropdown({ id }: { id: string }) {
  const [selected, setSelected] = useState('');
  const current = roleOptions.find((o) => o.value === selected);

  return (
    <div className="pricing-dropdown stack--xs">
      <label className="text-label--sm color--tertiary" htmlFor={`role-select-${id}`}>
        How many roles are you hiring for?
      </label>
      <div className="pricing-dropdown__select-wrap">
        <select
          id={`role-select-${id}`}
          className="pricing-dropdown__select text-body--sm"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">Select roles</option>
          {roleOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <svg className="pricing-dropdown__chevron" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M6.667 8.333L10 11.667l3.333-3.334" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {current && (
        <p className="pricing-dropdown__hint text-body--xs">
          {current.hint}
        </p>
      )}
    </div>
  );
}

interface PricingProps {
  bespokeHeading?: string;
  bespokeBody?: string;
  bespokeCtaLabel?: string;
  bespokeCtaHref?: string;
  theme?: string;
}

export default function Pricing({
  bespokeHeading = 'Need a more customised solution?',
  bespokeBody = 'We also offer tailored assessments for hiring, development or training, and end-to-end solutions that take candidates from initial application through to onboarding and beyond.',
  bespokeCtaLabel = 'Talk to us',
  bespokeCtaHref = '/contact',
  theme = 'dark',
}: PricingProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const labelRef = useFadeUp({ delay: 0, duration: 0.5, y: 16 });
  const headingRef = useTextReveal({ delay: 0.1 });
  const introRef = useFadeUp({ delay: 0.2, duration: 0.6, y: 16 });

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    return initGSAPSlider(el);
  }, []);

  return (
    <section className="pricing-section" data-theme={theme}>
      {/* Header */}
      <div className="container">
        <div className="pricing__header stack--lg">
          <span ref={labelRef as React.RefObject<HTMLSpanElement>} data-animate="" className="section-label">Pricing</span>
          <h2 ref={headingRef as React.RefObject<HTMLHeadingElement>} data-animate="" className="section-heading">Flexible pricing</h2>
          <p ref={introRef as React.RefObject<HTMLParagraphElement>} data-animate="" className="section-intro text-body--lg leading--snug">
            Vero Assess is available at four levels. Pick an option that works
            for you or get in touch to discuss our bespoke service.
          </p>
        </div>
      </div>

      {/* Slider */}
      <div
        ref={sliderRef}
        aria-label="Pricing tiers"
        data-gsap-slider-init=""
        role="region"
        aria-roledescription="carousel"
        className="pricing-slider"
      >
        <div data-gsap-slider-collection="" className="pricing-slider__collection">
          <div data-gsap-slider-list="" className="pricing-slider__list">
            {tiers.map((tier) => (
              <div key={tier.id} data-gsap-slider-item="" className="pricing-slider__item">
                <div className="pricing-card">
                  <div className="pricing-card__inner">
                    {/* Header + Price + Description */}
                    <div className="pricing-card__section stack--sm">
                      <span className="section-label">{tier.name}</span>
                      <div className="pricing-card__price-row">
                        <span className="pricing-card__price text-h3 color--primary">{tier.price}</span>
                        <span className="text-body--2xs color--tertiary">{tier.priceNote}</span>
                      </div>
                      <p className="text-body--sm color--secondary leading--snug">{tier.description}</p>
                    </div>

                    {/* Dropdown */}
                    <div className="pricing-card__section">
                      <RoleDropdown id={tier.id} />
                    </div>

                    {/* Features */}
                    <div className="pricing-card__section">
                      <ul className="pricing-card__features">
                        {tier.features.map((f, i) => (
                          <li key={i} className="pricing-card__feature text-body--xs color--secondary">
                            <span className="pricing-card__feature-icon" aria-hidden="true">
                              <svg viewBox="0 0 12 12" fill="none">
                                <path d="M3 6L5.25 8.25L9 3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Upgrade note */}
                    {tier.upgradeNote && (
                      <div className="pricing-card__section">
                        <p className="pricing-card__upgrade text-body--2xs color--tertiary">
                          {tier.upgradeNote}
                        </p>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="pricing-card__cta">
                      <Button
                        variant="primary"
                        size="sm"
                        href={tier.href}
                      >
                        {tier.cta}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="container">
          <div data-gsap-slider-controls="" className="pricing-slider__controls flex gap--sm">
            <button data-gsap-slider-control="prev" className="pricing-slider__control text-body--sm font--medium">Prev</button>
            <button data-gsap-slider-control="next" className="pricing-slider__control text-body--sm font--medium">Next</button>
          </div>
        </div>
      </div>

      {/* Bespoke CTA */}
      <div className="container">
        <div className="pricing__bespoke bordered-section">
          <div className="pricing__bespoke-inner">
            <div className="stack--md">
              <h3 className="text-h4 color--primary">{bespokeHeading}</h3>
              <p className="text-body--md color--secondary leading--relaxed max-ch-60">
                {bespokeBody}
              </p>
            </div>
            <Button variant="secondary" size="md" href={bespokeCtaHref}>
              {bespokeCtaLabel}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
