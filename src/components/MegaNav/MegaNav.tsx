'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
                  <Link href="/pricing" className="mega-nav__bar-link">
                    <span className="mega-nav__bar-link-label text-body--sm font--medium">Pricing</span>
                  </Link>
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
                  <li data-menu-fade=""><Link href="/assessments/administration" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Administration</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Dependable, organised talent</span></Link></li>
                  <li data-menu-fade=""><Link href="/assessments/operations-logistics" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Operations &amp; Logistics</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Precise, process-led hires</span></Link></li>
                  <li data-menu-fade=""><Link href="/assessments/sales" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Sales</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Commercially-minded performers</span></Link></li>
                  <li data-menu-fade=""><Link href="/assessments/retail-hospitality" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Retail &amp; Hospitality</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Service-led problem solvers</span></Link></li>
                  <li data-menu-fade=""><Link href="/assessments/health-social-care" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Health &amp; Social Care</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Compassionate, resilient staff</span></Link></li>
                </ul>
              </div>
              <div data-menu-fade="" className="mega-nav__panel-col">
                <span data-menu-fade="" className="mega-nav__panel-label text-label--sm color--tertiary">Early careers</span>
                <ul className="mega-nav__panel-list stack--xs">
                  <li data-menu-fade=""><Link href="/assessments/graduates" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Graduates</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Future leaders, assessed early</span></Link></li>
                  <li data-menu-fade=""><Link href="/assessments/apprentices" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Apprentices</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Spot potential beyond CVs</span></Link></li>
                  <li data-menu-fade=""><Link href="/assessments/interns" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Interns</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Build your talent pipeline</span></Link></li>
                </ul>
              </div>
              <div data-menu-fade="" className="mega-nav__panel-col is--colored">
                <span data-menu-fade="" className="mega-nav__panel-label text-label--sm color--tertiary">Specialist</span>
                <ul className="mega-nav__panel-list stack--xs">
                  <li data-menu-fade=""><Link href="/assessments/claims-collections" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Claims &amp; Collections</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Integrity under pressure</span></Link></li>
                  <li data-menu-fade=""><Link href="/assessments/field-service" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Field Service &amp; Technicians</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Practical and customer-facing</span></Link></li>
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
                  <li data-menu-fade=""><Link href="/solutions/high-volume-hiring" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">High-volume hiring</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Process unlimited applicants</span></Link></li>
                  <li data-menu-fade=""><Link href="/solutions/objective-assessment" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Objective assessment</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Decisions based on ability</span></Link></li>
                  <li data-menu-fade=""><Link href="/solutions/candidate-experience" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Candidate experience</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Fair, accessible and smooth</span></Link></li>
                  <li data-menu-fade=""><Link href="/solutions/ats-integration" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">ATS integration</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Connect with your systems</span></Link></li>
                </ul>
              </div>
              <div data-menu-fade="" className="mega-nav__panel-col">
                <span data-menu-fade="" className="mega-nav__panel-label text-label--sm color--tertiary">By sector</span>
                <ul className="mega-nav__panel-list stack--xs">
                  <li data-menu-fade=""><Link href="/solutions/public-sector" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Public sector</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Compliant, large-scale hiring</span></Link></li>
                  <li data-menu-fade=""><Link href="/solutions/healthcare" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Healthcare</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Values-led recruitment</span></Link></li>
                  <li data-menu-fade=""><Link href="/solutions/financial-services" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Financial services</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Secure, regulated hiring</span></Link></li>
                  <li data-menu-fade=""><Link href="/solutions/retail" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Retail</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Seasonal and high-turnover</span></Link></li>
                </ul>
              </div>
              <div data-menu-fade="" className="mega-nav__panel-col is--colored">
                <span data-menu-fade="" className="mega-nav__panel-label text-label--sm color--tertiary">Quick links</span>
                <ul className="mega-nav__panel-list stack--xs">
                  <li data-menu-fade=""><Link href="/how-it-works" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">How it works</span></Link></li>
                  <li data-menu-fade=""><Link href="/pricing" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Pricing</span></Link></li>
                  <li data-menu-fade=""><Link href="/contact" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Bespoke solutions</span></Link></li>
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
                  <li data-menu-fade=""><Link href="/about" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">About Vero Assess</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Our mission and approach</span></Link></li>
                  <li data-menu-fade=""><Link href="/about/tazio" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Powered by Tazio</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">The platform behind Vero</span></Link></li>
                  <li data-menu-fade=""><Link href="/contact" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Contact</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Get in touch</span></Link></li>
                </ul>
              </div>
              <div data-menu-fade="" className="mega-nav__panel-col">
                <span data-menu-fade="" className="mega-nav__panel-label text-label--sm color--tertiary">Resources</span>
                <ul className="mega-nav__panel-list stack--xs">
                  <li data-menu-fade=""><Link href="/resources/science" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">The science</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Research-backed methodology</span></Link></li>
                  <li data-menu-fade=""><Link href="/resources/compliance" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Compliance</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">ISO, WCAG, Cyber Essentials</span></Link></li>
                  <li data-menu-fade=""><Link href="/blog" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Blog</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Insights and updates</span></Link></li>
                </ul>
              </div>
              <div data-menu-fade="" className="mega-nav__panel-col is--colored has--card">
                <div className="mega-nav__card rounded--md">
                  <div className="mega-nav__card-visual">
                    <div className="mega-nav__card-visual-placeholder" />
                  </div>
                  <div className="mega-nav__card-content stack--sm">
                    <div className="mega-nav__card-text stack--xs">
                      <span className="text-body--sm font--medium color--primary">Live in 48 hours</span>
                      <span className="text-body--xs color--tertiary">Get your assessments running fast</span>
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
