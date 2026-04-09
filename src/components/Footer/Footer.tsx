import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { client } from '@/sanity/lib/client';
import { SITE_SETTINGS_QUERY, NAV_CATEGORIES_QUERY } from '@/sanity/lib/queries';
import './Footer.css';

/* Short display labels for the footer (keeps the column compact) */
const footerLabel: Record<string, string> = {
  'operations-and-logistics': 'Operations & Logistics',
  'retail-and-hospitality': 'Retail & Hospitality',
  'health-and-social-care': 'Health & Social Care',
  'claims-and-collections': 'Claims & Collections',
  'field-service-and-technicians': 'Field Service & Technicians',
};

/* Which slugs to feature in the footer (subset of all categories) */
const footerSlugs = [
  'administration',
  'graduates',
  'sales',
  'retail-and-hospitality',
];

const staticLinkColumns = [
  {
    title: 'Solutions',
    links: [
      { label: 'High-volume hiring', href: '/solutions/high-volume-hiring' },
      { label: 'Objective assessment', href: '/solutions/objective-assessment' },
      { label: 'Candidate experience', href: '/solutions/candidate-experience' },
      { label: 'ATS integration', href: '/solutions/ats-integration' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Powered by Tazio', href: '/about/tazio' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'The science', href: '/resources/science' },
      { label: 'Compliance', href: '/resources/compliance' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'How it works', href: '/how-it-works' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy', href: '/legal/privacy' },
      { label: 'Terms of service', href: '/legal/terms' },
      { label: 'Cookie policy', href: '/legal/cookies' },
    ],
  },
];

export default async function Footer() {
  const [settings, categories] = await Promise.all([
    client.fetch(SITE_SETTINGS_QUERY),
    client.fetch(NAV_CATEGORIES_QUERY) as Promise<{ name: string; slug: string }[]>,
  ]);

  /* Build the Assessments column dynamically from Sanity slugs */
  const assessmentLinks = footerSlugs
    .map((slug) => {
      const cat = categories?.find((c) => c.slug === slug);
      if (!cat) return null;
      return { label: footerLabel[cat.slug] ?? cat.name, href: `/assessments/${cat.slug}` };
    })
    .filter(Boolean) as { label: string; href: string }[];
  assessmentLinks.push({ label: 'All job families', href: '/assessments' });

  const linkColumns = [
    { title: 'Assessments', links: assessmentLinks },
    ...staticLinkColumns,
  ];

  const heading = settings?.footerCtaHeading ?? 'Ready to find the right people?';
  const body = settings?.footerCtaBody ?? 'Start assessing smarter. Go live within 48 hours with science-backed, role-specific assessments.';
  const btnLabel = settings?.footerCtaButtonLabel ?? 'Get started';
  const btnHref = settings?.footerCtaButtonHref ?? '/get-started';

  return (
    <footer className="footer" data-theme="brand-purple-deep">
      {/* ── CTA banner ── */}
      <div className="footer__cta-banner">
        <div className="container">
          <div className="footer__cta-inner bordered-section">
            <div className="footer__cta-logo">
              <Image src="/logo.svg" alt="Vero Assess" width={140} height={40} className="footer__logo-img" />
            </div>

            <div className="footer__cta-content">
              <div className="footer__cta-text">
                <h2 className="text-h2 color--primary">
                  {heading}
                </h2>
              </div>
              <div className="footer__cta-action">
                <p className="text-body--sm color--secondary leading--snug">
                  {body}
                </p>
                <div className="footer__cta-btn">
                  <Button variant="cta" size="md" href={btnHref}>
                    {btnLabel}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Link columns ── */}
      <div className="footer__links">
        <div className="container">
          <div className="footer__links-grid">
            {linkColumns.map((col) => (
              <div key={col.title} className="footer__col">
                <span className="footer__col-title text-label--sm color--brand">{col.title}</span>
                <ul className="footer__col-list">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="footer__link text-body--xs color--secondary">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="footer__bottom">
        <div className="container">
          <p className="text-body--2xs color--tertiary">
            &copy; {new Date().getFullYear()} Tazio Digital Ltd. All rights reserved. Vero Assess is a product of Tazio.
          </p>
        </div>
      </div>
    </footer>
  );
}
