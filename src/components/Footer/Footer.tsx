import Link from 'next/link';
import Image from 'next/image';
import { client } from '@/sanity/lib/client';
import { SITE_SETTINGS_QUERY, NAV_CATEGORIES_QUERY } from '@/sanity/lib/queries';
import CTAStatement from '@/components/CTAStatement/CTAStatement';
import FooterFan from './FooterFan';
import './Footer.css';

const linkColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Pricing', href: '/pricing' },
      { label: 'How it Works', href: '/how-it-works' },
      { label: 'Get started', href: '/get-started' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'The Science', href: '/resources/science' },
      { label: 'Compliance', href: '/resources/compliance' },
    ],
  },
];

/* Short display labels + grouping for the assessments section.
   Mirrors the grouping used by MegaNav so categories are sorted consistently
   across the site. */
type AssessmentGroup = 'jobFamilies' | 'earlyCareers' | 'specialist';

const assessmentMeta: Record<string, { group: AssessmentGroup; label: string }> = {
  'administration':                { group: 'jobFamilies',  label: 'Administration' },
  'operations-and-logistics':      { group: 'jobFamilies',  label: 'Operations & Logistics' },
  'sales':                         { group: 'jobFamilies',  label: 'Sales' },
  'retail-and-hospitality':        { group: 'jobFamilies',  label: 'Retail & Hospitality' },
  'health-and-social-care':        { group: 'jobFamilies',  label: 'Health & Social Care' },
  'graduates':                     { group: 'earlyCareers', label: 'Graduates' },
  'apprentices':                   { group: 'earlyCareers', label: 'Apprentices' },
  'interns':                       { group: 'earlyCareers', label: 'Interns' },
  'claims-and-collections':        { group: 'specialist',   label: 'Claims & Collections' },
  'field-service-and-technicians': { group: 'specialist',   label: 'Field Service' },
};

const assessmentGroups: { key: AssessmentGroup; title: string }[] = [
  { key: 'jobFamilies',  title: 'Job families' },
  { key: 'earlyCareers', title: 'Early careers' },
  { key: 'specialist',   title: 'Specialist' },
];

/* Policy links — privacy, cookies, and security live on this site
   (sourced from Sanity, rendered at /legal/<slug>). Modern slavery
   and status remain external to Tazio. */
const legalLinks: { label: string; href: string; external?: boolean }[] = [
  { label: 'Privacy Policy', href: '/legal/privacy' },
  { label: 'Cookie Policy', href: '/legal/cookies' },
  { label: 'Security', href: '/legal/security' },
  {
    label: 'Modern Slavery Statement',
    href: 'https://cdn.prod.website-files.com/66bb33f5cfec7c80b0da6fed/6925b1b4a26e3c0faa0ca494_Modern%20Slavery%20and%20Human%20Trafficking%20Statement%202025-2026.pdf',
    external: true,
  },
  { label: 'Status', href: 'https://status.tazio.network/', external: true },
];

/* Vero Assess doesn't run its own social presence — links route to
   Tazio (the parent service) per client direction. */
const socialLinks = [
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/tazio/',
    path: 'M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05A3.74 3.74 0 0 1 16.18 8.7c3.6 0 4.27 2.37 4.27 5.45v6.3ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.02H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.21 0 22.22 0Z',
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/channel/UCfXfmtOQsyrkSeBAjeWZ05g',
    path: 'M23.5 6.2a3.02 3.02 0 0 0-2.13-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.37.51A3.02 3.02 0 0 0 .5 6.2C0 8.07 0 12 0 12s0 3.93.5 5.8a3.02 3.02 0 0 0 2.13 2.14c1.87.51 9.37.51 9.37.51s7.5 0 9.37-.51a3.02 3.02 0 0 0 2.13-2.14c.5-1.87.5-5.8.5-5.8s0-3.93-.5-5.8ZM9.6 15.57V8.43L15.82 12 9.6 15.57Z',
  },
];

export default async function Footer() {
  const [settings, categories] = await Promise.all([
    client.fetch(SITE_SETTINGS_QUERY),
    client.fetch(NAV_CATEGORIES_QUERY) as Promise<{ name: string; slug: string }[]>,
  ]);

  const ctaHref = settings?.footerCtaButtonHref ?? '/get-started';
  const ctaLabel = settings?.footerCtaButtonLabel ?? 'Get started';
  const year = new Date().getFullYear();

  // Group categories by their assigned section, drop unknown slugs so the
  // footer only renders categories the design has been planned for.
  const groupedAssessments = assessmentGroups.map((group) => ({
    ...group,
    items: (categories ?? [])
      .filter((c) => assessmentMeta[c.slug]?.group === group.key)
      .map((c) => ({
        label: assessmentMeta[c.slug]?.label ?? c.name,
        href: `/assessments/${c.slug}`,
      })),
  }));

  return (
    <footer className="footer" data-theme="brand-purple-deep">

      {/* ── Decorative shape fan — top-left corner, animates in on scroll ── */}
      <FooterFan position="top-left" />

      {/* ── Closing CTA — mirrors the home page CTAStatement ─── */}
      <div className="footer__cta">
        <CTAStatement
          theme="brand-purple-deep"
          cta={{ label: ctaLabel, href: ctaHref }}
          secondaryCta={{ label: 'Talk to sales', href: '/contact' }}
        />
      </div>

      <div className="container container--wide footer__inner">

        {/* ── Unified nav: Product / Company / Resources + 3 assessment groups ── */}
        <nav className="footer__nav" aria-label="Footer navigation">
          {linkColumns.map((col) => (
            <div key={col.title} className="footer__nav-col">
              <span className="footer__nav-title text-label--lg color--brand">
                {col.title}
              </span>
              <ul className="footer__nav-list">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="footer__nav-link text-body--sm color--secondary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {groupedAssessments.map(
            (group) =>
              group.items.length > 0 && (
                <div key={group.key} className="footer__nav-col">
                  <span className="footer__nav-title text-label--lg color--brand">
                    {group.title}
                  </span>
                  <ul className="footer__nav-list">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="footer__nav-link text-body--sm color--secondary"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ),
          )}
        </nav>

        {/* ── Contact strip: Phone / Email / Address ─────────── */}
        <div className="footer__contact">
          <a href="tel:+442922331888" className="footer__contact-item">
            <span className="footer__contact-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.8 12.4 19.79 19.79 0 0 1 1.73 3.8 2 2 0 0 1 3.72 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.69a16 16 0 0 0 6.29 6.29l1.06-1.06a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <div className="footer__contact-text">
              <span className="footer__contact-label text-label--md color--tertiary">Phone</span>
              <span className="color--primary font--medium">+44 (0)2922 331 888</span>
            </div>
          </a>

          <a href="mailto:support@veroassess.com" className="footer__contact-item">
            <span className="footer__contact-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <div className="footer__contact-text">
              <span className="footer__contact-label text-label--md color--tertiary">Email</span>
              <span className="color--primary font--medium">support@veroassess.com</span>
            </div>
          </a>

          <div className="footer__contact-item">
            <span className="footer__contact-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </span>
            <div className="footer__contact-text">
              <span className="footer__contact-label text-label--md color--tertiary">Address</span>
              <span className="color--primary font--medium">Cardiff, Wales, UK</span>
            </div>
          </div>
        </div>

        {/* ── Centered brand close ──────────────────────────────
             White Vero Assess logo removed per client direction —
             the wordmark already appears in the top nav so the close
             block now leads with the social row + copyright meta. */}
        <div className="footer__close">
          <ul className="footer__social" aria-label="Social media">
            {socialLinks.map((s) => (
              <li key={s.name}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer__social-link"
                  aria-label={s.name}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>

          {/* Business info — full registered-company line per client copy.
               year stays inline since this updates with each render. */}
          <p className="footer__close-business text-body--xs color--tertiary">
            Vero is a service offered by Tazio. Tazio is a service from Tazio
            Online Media Limited &mdash; Registered in England &amp; Wales No:
            03392879. Registered Office: Beechwood House, Greenwood Close,
            Cardiff Gate, Pontprennau, Cardiff CF23 8RD.
          </p>

          <p className="footer__close-meta text-body--xs color--tertiary">
            <span>&copy; {year} Tazio Online Media Limited.</span>
            {legalLinks.map((l) =>
              l.external ? (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer__close-legal-link"
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.href}
                  href={l.href}
                  className="footer__close-legal-link"
                >
                  {l.label}
                </Link>
              ),
            )}
            {/* Opens the vanilla-cookieconsent preferences modal — the
                library wires the click via the data-cc attribute. */}
            <button
              type="button"
              data-cc="show-preferencesModal"
              className="footer__close-legal-link"
            >
              Cookie preferences
            </button>
          </p>

          <div className="footer__partner">
            <span className="text-body--sm color--tertiary">In partnership with</span>
            <Image
              src="/66bb33f5cfec7c80b0da70da_iselogo.png"
              alt="Institute of Student Employers"
              width={160}
              height={64}
              className="footer__partner-logo"
            />
          </div>
        </div>

      </div>

      {/* ── Decorative shape fan — bottom-right corner ───────── */}
      <FooterFan position="bottom-right" />
    </footer>
  );
}
