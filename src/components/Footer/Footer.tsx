import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import './Footer.css';

const linkColumns = [
  {
    title: 'Assessments',
    links: [
      { label: 'Administration', href: '/assessments/administration' },
      { label: 'Graduates', href: '/assessments/graduates' },
      { label: 'Sales', href: '/assessments/sales' },
      { label: 'Retail & Hospitality', href: '/assessments/retail-hospitality' },
      { label: 'All job families', href: '/assessments' },
    ],
  },
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

export default function Footer() {
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
                  Ready to find the right people?
                </h2>
              </div>
              <div className="footer__cta-action">
                <p className="text-body--sm color--secondary leading--snug">
                  Start assessing smarter. Go live within 48 hours with
                  science-backed, role-specific assessments.
                </p>
                <div className="footer__cta-btn">
                  <Button variant="cta" size="md" href="/get-started">
                    Get started
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
