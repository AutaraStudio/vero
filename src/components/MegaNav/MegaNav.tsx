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
  _id?: string | null;
  name?: string | null;
  slug?: string | null;
  navDescription?: string | null;
}

export interface NavCategoryGroup {
  _key?: string | null;
  title?: string | null;
  categories?: NavCategory[] | null;
}

export interface NavLink {
  label?: string | null;
  description?: string | null;
  href?: string | null;
  external?: boolean | null;
}

export interface NavColumn {
  _key?: string | null;
  title?: string | null;
  links?: NavLink[] | null;
}

export interface NavCompanyCard {
  eyebrow?: string | null;
  body?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
}

export interface NavTopItem {
  _key?: string | null;
  _type?: 'plainLink' | 'assessmentsDropdown' | 'companyDropdown' | string | null;
  label?: string | null;
  href?: string | null;
  external?: boolean | null;
}

interface MegaNavProps {
  topItems?: NavTopItem[];
  companyColumns?: NavColumn[];
  companyCard?: NavCompanyCard | null;
  ctaLabel?: string;
  ctaHref?: string;
  categoryGroups?: NavCategoryGroup[];
}

/* ── Component ── */

export default function MegaNav({
  topItems = [],
  companyColumns = [],
  companyCard = null,
  ctaLabel = 'Get started',
  ctaHref = '/get-started',
  categoryGroups = [],
}: MegaNavProps) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    return initMegaNav(el);
  }, []);

  /* Has the editor placed each dropdown trigger? Used to gate panel
     rendering so we don't show empty dropdowns on a misconfigured nav. */
  const hasAssessmentsDropdown = topItems.some((i) => i?._type === 'assessmentsDropdown');
  const hasCompanyDropdown = topItems.some((i) => i?._type === 'companyDropdown');

  /* All categories that ended up inside any group. */
  const visibleCategoryGroups = (categoryGroups ?? [])
    .map((g) => ({
      _key: g._key,
      title: g.title ?? '',
      categories: (g.categories ?? []).filter(
        (c): c is NavCategory & { slug: string; name: string } => Boolean(c?.slug && c?.name),
      ),
    }))
    .filter((g) => g.title && g.categories.length > 0);

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
                {topItems.map((item, i) => {
                  const key = item._key ?? `top-${i}`;
                  if (item._type === 'assessmentsDropdown') {
                    return (
                      <li key={key} data-nav-list-item="">
                        <button
                          data-dropdown-toggle="assessments"
                          aria-expanded="false"
                          aria-haspopup="true"
                          className="mega-nav__bar-link is--dropdown"
                        >
                          <span className="mega-nav__bar-link-label text-body--sm font--medium">
                            {item.label ?? 'Assessments'}
                          </span>
                          <ChevronDown className="mega-nav__bar-link-icon is--dropdown" />
                        </button>
                      </li>
                    );
                  }
                  if (item._type === 'companyDropdown') {
                    return (
                      <li key={key} data-nav-list-item="">
                        <button
                          data-dropdown-toggle="company"
                          aria-expanded="false"
                          aria-haspopup="true"
                          className="mega-nav__bar-link is--dropdown"
                        >
                          <span className="mega-nav__bar-link-label text-body--sm font--medium">
                            {item.label ?? 'Company'}
                          </span>
                          <ChevronDown className="mega-nav__bar-link-icon is--dropdown" />
                        </button>
                      </li>
                    );
                  }
                  // Plain link
                  if (!item.label || !item.href) return null;
                  const isExternal = item.external || /^https?:\/\//.test(item.href);
                  return (
                    <li key={key} data-nav-list-item="">
                      {isExternal ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mega-nav__bar-link"
                        >
                          <span className="mega-nav__bar-link-label text-body--sm font--medium">
                            {item.label}
                          </span>
                        </a>
                      ) : (
                        <Link href={item.href} className="mega-nav__bar-link">
                          <span className="mega-nav__bar-link-label text-body--sm font--medium">
                            {item.label}
                          </span>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* Actions */}
              <ul data-nav-list-item="" className="mega-nav__bar-list is--actions flex gap--sm">
                <li className="mega-nav__bar-action">
                  <NavBasket
                    categories={visibleCategoryGroups.flatMap((g) => g.categories.map((c) => ({ name: c.name, slug: c.slug })))}
                  />
                </li>
                <li className="mega-nav__bar-action">
                  <Button variant="primary" size="sm" href={ctaHref}>
                    {ctaLabel}
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

          {/* ── Assessments panel — driven by globalCategoryGroups ── */}
          {hasAssessmentsDropdown && (
            <div data-panel-state="" data-nav-content="assessments" role="region" aria-label="assessments menu" className="mega-nav__dropdown-panel">
              <div className="mega-nav__dropdown-inner flex">
                {visibleCategoryGroups.map((group, gi) => {
                  const colored = gi === visibleCategoryGroups.length - 1; /* last group gets the accent column */
                  return (
                    <div key={group._key ?? group.title} data-menu-fade="" className={`mega-nav__panel-col${colored ? ' is--colored' : ''}`}>
                      <span data-menu-fade="" className="mega-nav__panel-label text-label--sm color--tertiary">{group.title}</span>
                      <ul className="mega-nav__panel-list stack--xs">
                        {group.categories.map((cat) => (
                          <li key={cat.slug} data-menu-fade="">
                            <Link href={`/assessments/${cat.slug}`} className="mega-nav__panel-link rounded--sm">
                              <span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">{cat.name}</span>
                              {cat.navDescription && (
                                <span className="mega-nav__panel-link-desc text-body--xs color--tertiary">{cat.navDescription}</span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Company panel — driven by globalNav.companyColumns + companyCard ── */}
          {hasCompanyDropdown && (
            <div data-panel-state="" data-nav-content="company" role="region" aria-label="company menu" className="mega-nav__dropdown-panel">
              <div className="mega-nav__dropdown-inner flex">
                {(companyColumns ?? []).map((col, i) => col?.title && (
                  <div key={col._key ?? `${col.title}-${i}`} data-menu-fade="" className="mega-nav__panel-col">
                    <span data-menu-fade="" className="mega-nav__panel-label text-label--sm color--tertiary">{col.title}</span>
                    <ul className="mega-nav__panel-list stack--xs">
                      {(col.links ?? []).map((link, li) => {
                        if (!link?.label || !link?.href) return null;
                        const isExternal = link.external || /^https?:\/\//.test(link.href);
                        const inner = (
                          <>
                            <span className="mega-nav__panel-link-text text-body--sm font--medium color--primary">{link.label}</span>
                            {link.description && (
                              <span className="mega-nav__panel-link-desc text-body--xs color--tertiary">{link.description}</span>
                            )}
                          </>
                        );
                        return (
                          <li key={`${col._key ?? col.title}-${li}-${link.href}`} data-menu-fade="">
                            {isExternal ? (
                              <a
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mega-nav__panel-link rounded--sm"
                              >
                                {inner}
                              </a>
                            ) : (
                              <Link href={link.href} className="mega-nav__panel-link rounded--sm">
                                {inner}
                              </Link>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}

                {companyCard?.eyebrow && (
                  <div data-menu-fade="" className="mega-nav__panel-col is--colored has--card">
                    <div className="mega-nav__card rounded--md">
                      <div className="mega-nav__card-visual">
                        {companyCard.imageUrl ? (
                          <Image
                            src={companyCard.imageUrl}
                            alt={companyCard.imageAlt ?? ''}
                            fill
                            sizes="320px"
                            className="mega-nav__card-image"
                          />
                        ) : (
                          <div className="mega-nav__card-visual-placeholder" />
                        )}
                      </div>
                      <div className="mega-nav__card-content stack--sm">
                        <div className="mega-nav__card-text">
                          <p className="text-body--sm font--medium color--primary">{companyCard.eyebrow}</p>
                          {companyCard.body && (
                            <p className="text-body--xs color--tertiary">{companyCard.body}</p>
                          )}
                        </div>
                        {companyCard.ctaLabel && companyCard.ctaHref && (
                          <Button variant="primary" size="sm" href={companyCard.ctaHref}>
                            {companyCard.ctaLabel}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div data-menu-backdrop="" className="mega-nav__backdrop" />
    </nav>
  );
}
