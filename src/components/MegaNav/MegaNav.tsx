'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { initMegaNav } from './megaNavAnimations';
import NavBasket from './NavBasket';
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

/* ── Types ── */

export interface NavCategory {
  name: string;
  slug: string;
}

/* ── Nav grouping config ── */
/* Maps each slug to its column group and short description shown in the menu. */
/* If a new category is added in Sanity, add it here to include it in the nav. */

type NavGroup = 'jobFamilies' | 'earlyCareers' | 'specialist';

const categoryMeta: Record<string, { group: NavGroup; label: string; desc: string }> = {
  'administration':                { group: 'jobFamilies',  label: 'Administration',              desc: 'Dependable, organised talent' },
  'operations-and-logistics':      { group: 'jobFamilies',  label: 'Operations & Logistics',      desc: 'Precise, process-led hires' },
  'sales':                         { group: 'jobFamilies',  label: 'Sales',                       desc: 'Commercially-minded performers' },
  'retail-and-hospitality':        { group: 'jobFamilies',  label: 'Retail & Hospitality',        desc: 'Service-led problem solvers' },
  'health-and-social-care':        { group: 'jobFamilies',  label: 'Health & Social Care',        desc: 'Compassionate, resilient staff' },
  'graduates':                     { group: 'earlyCareers', label: 'Graduates',                   desc: 'Future leaders, assessed early' },
  'apprentices':                   { group: 'earlyCareers', label: 'Apprentices',                 desc: 'Spot potential beyond CVs' },
  'interns':                       { group: 'earlyCareers', label: 'Interns',                     desc: 'Build your talent pipeline' },
  'claims-and-collections':        { group: 'specialist',   label: 'Claims & Collections',        desc: 'Integrity under pressure' },
  'field-service-and-technicians': { group: 'specialist',   label: 'Field Service & Technicians', desc: 'Practical and customer-facing' },
};

/* ── Component ── */

interface MegaNavProps {
  navCtaLabel?: string;
  navCtaHref?: string;
  categories?: NavCategory[];
}

export default function MegaNav({
  navCtaLabel = 'Get started',
  navCtaHref = '/get-started',
  categories = [],
}: MegaNavProps) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    return initMegaNav(el);
  }, []);

  return (
    <nav ref={navRef} data-menu-open="false" data-menu-wrap="" className="mega-nav">
      <div className="mega-nav__bar">
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
                  <NavBasket categories={categories} />
                </li>
                <li className="mega-nav__bar-action">
                  <Button variant="secondary" size="sm" href="https://app.tazio.io" external>
                    Log in
                  </Button>
                </li>
                <li className="mega-nav__bar-action">
                  <Button variant="primary" size="sm" href={navCtaHref}>
                    {navCtaLabel}
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
              {([
                { key: 'jobFamilies',  title: 'Job families',  colored: false },
                { key: 'earlyCareers', title: 'Early careers', colored: false },
                { key: 'specialist',   title: 'Specialist',    colored: true },
              ] as const).map(({ key, title, colored }) => {
                const items = categories
                  .filter((c) => categoryMeta[c.slug]?.group === key)
                  .map((c) => ({ slug: c.slug, ...categoryMeta[c.slug] }));
                if (items.length === 0) return null;
                return (
                  <div key={key} data-menu-fade="" className={`mega-nav__panel-col${colored ? ' is--colored' : ''}`}>
                    <span data-menu-fade="" className="mega-nav__panel-label text-label--sm color--tertiary">{title}</span>
                    <ul className="mega-nav__panel-list stack--xs">
                      {items.map((item) => (
                        <li key={item.slug} data-menu-fade="">
                          <Link href={`/assessments/${item.slug}`} className="mega-nav__panel-link rounded--sm">
                            <span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">{item.label}</span>
                            <span className="mega-nav__panel-link-desc text-body--xs color--tertiary">{item.desc}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Company panel ── */}
          <div data-panel-state="" data-nav-content="company" role="region" aria-label="company menu" className="mega-nav__dropdown-panel">
            <div className="mega-nav__dropdown-inner flex">
              <div data-menu-fade="" className="mega-nav__panel-col">
                <span data-menu-fade="" className="mega-nav__panel-label text-label--sm color--tertiary">Company</span>
                <ul className="mega-nav__panel-list stack--xs">
                  <li data-menu-fade=""><Link href="/about" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">About Vero Assess</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Our mission and approach</span></Link></li>
                  <li data-menu-fade=""><Link href="/contact" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Contact</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Get in touch</span></Link></li>
                </ul>
              </div>
              <div data-menu-fade="" className="mega-nav__panel-col">
                <span data-menu-fade="" className="mega-nav__panel-label text-label--sm color--tertiary">Resources</span>
                <ul className="mega-nav__panel-list stack--xs">
                  <li data-menu-fade=""><Link href="/how-it-works" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">How it works</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Our assessment process</span></Link></li>
                  <li data-menu-fade=""><Link href="/pricing" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Pricing</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Plans for every team size</span></Link></li>
                  <li data-menu-fade=""><Link href="/resources/science" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">The science</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">Research-backed methodology</span></Link></li>
                  <li data-menu-fade=""><Link href="/resources/compliance" className="mega-nav__panel-link rounded--sm"><span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">Compliance</span><span className="mega-nav__panel-link-desc text-body--xs color--tertiary">ISO, WCAG, Cyber Essentials</span></Link></li>
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
