'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import TransitionLink from '@/components/TransitionLink';
import Button from '@/components/ui/Button';
import { initMegaNav } from './megaNavAnimations';
import './MegaNav.css';

/* ── Inline SVG helpers ── */

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M6.6665 8.3335L9.99984 11.6668L13.3332 8.3335" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M11.6665 6.6665L8.33317 9.99984L11.6665 13.3332" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Component ── */

export default function MegaNav() {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    return initMegaNav(el);
  }, []);

  return (
    <nav ref={navRef} data-menu-open="false" data-menu-wrap="" className="mega-nav">
      <div className="mega-nav__bar surface--raised">
        <div className="mega-nav__container flex--between">
          <div className="mega-nav__bar-start flex">

            {/* Logo */}
            <Link href="/" data-menu-logo="" className="mega-nav__bar-logo">
              <Image src="/logo.svg" alt="Vero Assess" width={120} height={34} priority />
            </Link>

            {/* Nav inner */}
            <div data-nav-list="" data-mobile-nav="" className="mega-nav__bar-inner flex gap--sm">
              <ul className="mega-nav__bar-list flex gap--xs">
                <li data-nav-list-item="">
                  <button data-dropdown-toggle="assessments" aria-expanded="false" aria-haspopup="true" className="mega-nav__bar-link is--dropdown">
                    <span className="mega-nav__bar-link-label text-body--sm font--medium">Assessments</span>
                    <ChevronDown className="mega-nav__bar-link-icon is--dropdown" />
                  </button>
                </li>
                <li data-nav-list-item="">
                  <button data-dropdown-toggle="solutions" aria-expanded="false" aria-haspopup="true" className="mega-nav__bar-link is--dropdown">
                    <span className="mega-nav__bar-link-label text-body--sm font--medium">Solutions</span>
                    <ChevronDown className="mega-nav__bar-link-icon is--dropdown" />
                  </button>
                </li>
                <li data-nav-list-item="">
                  <button data-dropdown-toggle="company" aria-expanded="false" aria-haspopup="true" className="mega-nav__bar-link is--dropdown">
                    <span className="mega-nav__bar-link-label text-body--sm font--medium">Company</span>
                    <ChevronDown className="mega-nav__bar-link-icon is--dropdown" />
                  </button>
                </li>
                <li data-nav-list-item="">
                  <TransitionLink href="/pricing" transitionTitle="Pricing" className="mega-nav__bar-link">
                    <span className="mega-nav__bar-link-label text-body--sm font--medium">Pricing</span>
                  </TransitionLink>
                </li>
              </ul>

              {/* Actions */}
              <ul data-nav-list-item="" className="mega-nav__bar-list is--actions flex gap--sm">
                <li className="mega-nav__bar-action">
                  <Button variant="secondary" size="sm" href="https://app.tazio.io" external>
                    Log in
                  </Button>
                </li>
                <li className="mega-nav__bar-action">
                  <Button variant="primary" size="sm" href="/get-started">
                    Get started
                  </Button>
                </li>
              </ul>
            </div>

            {/* Burger (mobile) */}
            <div className="mega-nav__bar-end">
              <button data-burger-toggle="" aria-label="toggle menu" aria-expanded="false" className="mega-nav__burger surface--brand-subtle rounded--sm">
                <span data-burger-line="top" className="mega-nav__burger-line" />
                <span data-burger-line="mid" className="mega-nav__burger-line" />
                <span data-burger-line="bot" className="mega-nav__burger-line" />
              </button>
            </div>

            {/* Back button (mobile panel) */}
            <div data-mobile-back="" className="mega-nav__back">
              <button aria-label="back to menu" className="mega-nav__bar-link is--back">
                <ChevronLeft className="mega-nav__bar-link-icon" />
                <span className="mega-nav__bar-link-label text-body--sm font--medium">Back</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Dropdown panels ── */}
      <div data-dropdown-wrapper="" className="mega-nav__dropdown-wrapper">
        <div data-dropdown-container="" className="mega-nav__dropdown-container">
          <div data-dropdown-bg="" className="mega-nav__dropdown-bg surface--raised" />

          {/* ── Assessments panel ── */}
          <div data-panel-state="" data-nav-content="assessments" role="region" aria-label="assessments menu" className="mega-nav__dropdown-panel">
            <div className="mega-nav__dropdown-inner flex">
              <div data-menu-fade="" className="mega-nav__panel-col">
                <span data-menu-fade="" className="mega-nav__panel-label text-label--sm color--tertiary">Job families</span>
                <ul className="mega-nav__panel-list stack--xs">
                  <li data-menu-fade=""><TransitionLink href="/assessments/administration" transitionTitle="Administration" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Administration</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Dependable, organised talent</span></TransitionLink></li>
                  <li data-menu-fade=""><TransitionLink href="/assessments/operations-logistics" transitionTitle="Operations & Logistics" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Operations &amp; Logistics</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Precise, process-led hires</span></TransitionLink></li>
                  <li data-menu-fade=""><TransitionLink href="/assessments/sales" transitionTitle="Sales" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Sales</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Commercially-minded performers</span></TransitionLink></li>
                  <li data-menu-fade=""><TransitionLink href="/assessments/retail-hospitality" transitionTitle="Retail & Hospitality" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Retail &amp; Hospitality</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Service-led problem solvers</span></TransitionLink></li>
                  <li data-menu-fade=""><TransitionLink href="/assessments/health-social-care" transitionTitle="Health & Social Care" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Health &amp; Social Care</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Compassionate, resilient staff</span></TransitionLink></li>
                </ul>
              </div>
              <div data-menu-fade="" className="mega-nav__panel-col">
                <span data-menu-fade="" className="mega-nav__panel-label text-label--sm color--tertiary">Early careers</span>
                <ul className="mega-nav__panel-list stack--xs">
                  <li data-menu-fade=""><TransitionLink href="/assessments/graduates" transitionTitle="Graduates" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Graduates</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Future leaders, assessed early</span></TransitionLink></li>
                  <li data-menu-fade=""><TransitionLink href="/assessments/apprentices" transitionTitle="Apprentices" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Apprentices</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Spot potential beyond CVs</span></TransitionLink></li>
                  <li data-menu-fade=""><TransitionLink href="/assessments/interns" transitionTitle="Interns" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Interns</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Build your talent pipeline</span></TransitionLink></li>
                </ul>
              </div>
              <div data-menu-fade="" className="mega-nav__panel-col is--colored">
                <span data-menu-fade="" className="mega-nav__panel-label text-label--sm color--tertiary">Specialist</span>
                <ul className="mega-nav__panel-list stack--xs">
                  <li data-menu-fade=""><TransitionLink href="/assessments/claims-collections" transitionTitle="Claims & Collections" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Claims &amp; Collections</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Integrity under pressure</span></TransitionLink></li>
                  <li data-menu-fade=""><TransitionLink href="/assessments/field-service" transitionTitle="Field Service & Technicians" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Field Service &amp; Technicians</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Practical and customer-facing</span></TransitionLink></li>
                </ul>
              </div>
            </div>
          </div>

          {/* ── Solutions panel ── */}
          <div data-panel-state="" data-nav-content="solutions" role="region" aria-label="solutions menu" className="mega-nav__dropdown-panel">
            <div className="mega-nav__dropdown-inner flex">
              <div data-menu-fade="" className="mega-nav__panel-col">
                <span data-menu-fade="" className="mega-nav__panel-label text-label--sm color--tertiary">By challenge</span>
                <ul className="mega-nav__panel-list stack--xs">
                  <li data-menu-fade=""><TransitionLink href="/solutions/high-volume-hiring" transitionTitle="High-volume hiring" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">High-volume hiring</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Process unlimited applicants</span></TransitionLink></li>
                  <li data-menu-fade=""><TransitionLink href="/solutions/objective-assessment" transitionTitle="Objective assessment" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Objective assessment</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Decisions based on ability</span></TransitionLink></li>
                  <li data-menu-fade=""><TransitionLink href="/solutions/candidate-experience" transitionTitle="Candidate experience" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Candidate experience</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Fair, accessible and smooth</span></TransitionLink></li>
                  <li data-menu-fade=""><TransitionLink href="/solutions/ats-integration" transitionTitle="ATS integration" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">ATS integration</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Connect with your systems</span></TransitionLink></li>
                </ul>
              </div>
              <div data-menu-fade="" className="mega-nav__panel-col">
                <span data-menu-fade="" className="mega-nav__panel-label text-label--sm color--tertiary">By sector</span>
                <ul className="mega-nav__panel-list stack--xs">
                  <li data-menu-fade=""><TransitionLink href="/solutions/public-sector" transitionTitle="Public sector" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Public sector</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Compliant, large-scale hiring</span></TransitionLink></li>
                  <li data-menu-fade=""><TransitionLink href="/solutions/healthcare" transitionTitle="Healthcare" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Healthcare</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Values-led recruitment</span></TransitionLink></li>
                  <li data-menu-fade=""><TransitionLink href="/solutions/financial-services" transitionTitle="Financial services" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Financial services</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Secure, regulated hiring</span></TransitionLink></li>
                  <li data-menu-fade=""><TransitionLink href="/solutions/retail" transitionTitle="Retail" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Retail</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Seasonal and high-turnover</span></TransitionLink></li>
                </ul>
              </div>
              <div data-menu-fade="" className="mega-nav__panel-col is--colored">
                <span data-menu-fade="" className="mega-nav__panel-label text-label--sm color--tertiary">Quick links</span>
                <ul className="mega-nav__panel-list stack--xs">
                  <li data-menu-fade=""><TransitionLink href="/how-it-works" transitionTitle="How it works" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">How it works</span></TransitionLink></li>
                  <li data-menu-fade=""><TransitionLink href="/pricing" transitionTitle="Pricing" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Pricing</span></TransitionLink></li>
                  <li data-menu-fade=""><TransitionLink href="/contact" transitionTitle="Bespoke solutions" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Bespoke solutions</span></TransitionLink></li>
                </ul>
              </div>
            </div>
          </div>

          {/* ── Company panel ── */}
          <div data-panel-state="" data-nav-content="company" role="region" aria-label="company menu" className="mega-nav__dropdown-panel">
            <div className="mega-nav__dropdown-inner flex">
              <div data-menu-fade="" className="mega-nav__panel-col">
                <span data-menu-fade="" className="mega-nav__panel-label text-label--sm color--tertiary">Company</span>
                <ul className="mega-nav__panel-list stack--xs">
                  <li data-menu-fade=""><TransitionLink href="/about" transitionTitle="About" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">About Vero Assess</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Our mission and approach</span></TransitionLink></li>
                  <li data-menu-fade=""><TransitionLink href="/about/tazio" transitionTitle="Powered by Tazio" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Powered by Tazio</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">The platform behind Vero</span></TransitionLink></li>
                  <li data-menu-fade=""><TransitionLink href="/contact" transitionTitle="Contact" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Contact</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Get in touch</span></TransitionLink></li>
                </ul>
              </div>
              <div data-menu-fade="" className="mega-nav__panel-col">
                <span data-menu-fade="" className="mega-nav__panel-label text-label--sm color--tertiary">Resources</span>
                <ul className="mega-nav__panel-list stack--xs">
                  <li data-menu-fade=""><TransitionLink href="/resources/science" transitionTitle="The science" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">The science</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Research-backed methodology</span></TransitionLink></li>
                  <li data-menu-fade=""><TransitionLink href="/resources/compliance" transitionTitle="Compliance" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Compliance</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">ISO, WCAG, Cyber Essentials</span></TransitionLink></li>
                  <li data-menu-fade=""><TransitionLink href="/blog" transitionTitle="Blog" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Blog</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Insights and updates</span></TransitionLink></li>
                </ul>
              </div>
              <div data-menu-fade="" className="mega-nav__panel-col is--colored has--card">
                <div className="mega-nav__card rounded--md">
                  <div className="mega-nav__card-visual">
                    <div className="mega-nav__card-visual-placeholder" />
                  </div>
                  <div className="mega-nav__card-content stack--sm">
                    <div className="mega-nav__card-text">
                      <p className="text-body--sm font--medium color--primary">Live in 48 hours</p>
                      <p className="text-body--xs color--tertiary">Get your assessments running fast</p>
                    </div>
                    <Button variant="primary" size="sm" href="/get-started">
                      Get started
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div data-menu-backdrop="" className="mega-nav__backdrop" />
    </nav>
  );
}
