import Link from 'next/link';
import Image from 'next/image';
import { client } from '@/sanity/lib/client';
import {
  GLOBAL_FOOTER_QUERY,
  GLOBAL_CATEGORY_GROUPS_QUERY,
} from '@/sanity/lib/queries';
import CTAStatement from '@/components/CTAStatement/CTAStatement';
import { SocialIcon, platformLabel } from './socialIcons';
import FooterFan from './FooterFan';
import './Footer.css';

/* ── Types from the CMS query ────────────────────────────────── */

interface FooterLink {
  label?: string | null;
  href?: string | null;
  external?: boolean | null;
}
interface FooterColumn {
  title?: string | null;
  links?: FooterLink[] | null;
}
interface SocialLink {
  platform?: string | null;
  url?: string | null;
}
interface GlobalFooterData {
  ctaHeading?: string | null;
  ctaEyebrow?: string | null;
  ctaBenefits?: string[] | null;
  ctaPrimaryLabel?: string | null;
  ctaPrimaryHref?: string | null;
  ctaSecondaryLabel?: string | null;
  ctaSecondaryHref?: string | null;
  linkColumns?: FooterColumn[] | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  contactAddress?: string | null;
  socialLinks?: SocialLink[] | null;
  legalLinks?: FooterLink[] | null;
  businessText?: string | null;
  copyrightText?: string | null;
  partnerLabel?: string | null;
  partnerLogoUrl?: string | null;
  partnerLogoAlt?: string | null;
}

interface CategoryGroupItem {
  _id?: string | null;
  name?: string | null;
  slug?: string | null;
}
interface CategoryGroup {
  _key?: string | null;
  title?: string | null;
  categories?: CategoryGroupItem[] | null;
}
interface CategoryGroupsData {
  groups?: CategoryGroup[] | null;
}

/* ── Helpers ─────────────────────────────────────────────────── */

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

function renderInternalOrExternalLink(
  link: { label?: string | null; href?: string | null; external?: boolean | null } | null | undefined,
  className: string,
  key?: string,
) {
  if (!link?.label || !link.href) return null;
  const isExternal = link.external || /^https?:\/\//.test(link.href);
  return isExternal ? (
    <a
      key={key ?? link.href}
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {link.label}
    </a>
  ) : (
    <Link key={key ?? link.href} href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

/* ── Component ───────────────────────────────────────────────── */

export default async function Footer() {
  const [footer, categoryGroups] = await Promise.all([
    client.fetch<GlobalFooterData | null>(GLOBAL_FOOTER_QUERY),
    client.fetch<CategoryGroupsData | null>(GLOBAL_CATEGORY_GROUPS_QUERY),
  ]);

  const year = new Date().getFullYear();
  const ctaPrimary = {
    label: footer?.ctaPrimaryLabel ?? 'Get started',
    href: footer?.ctaPrimaryHref ?? '/get-started',
  };
  const ctaSecondary = footer?.ctaSecondaryLabel
    ? { label: footer.ctaSecondaryLabel, href: footer.ctaSecondaryHref ?? '#' }
    : undefined;

  const copyright = (footer?.copyrightText ?? '© {year} Tazio Online Media Limited.').replace('{year}', String(year));

  const groups = (categoryGroups?.groups ?? []).map((g) => ({
    key: g._key ?? g.title ?? 'group',
    title: g.title ?? '',
    items: (g.categories ?? []).filter((c): c is CategoryGroupItem & { slug: string; name: string } =>
      Boolean(c?.slug && c?.name),
    ),
  })).filter((g) => g.title && g.items.length > 0);

  return (
    <footer className="footer" data-theme="brand-purple-deep">

      {/* ── Decorative shape fan — top-left corner ─────────── */}
      <FooterFan position="top-left" />

      {/* ── Closing CTA — full content from globalFooter ─── */}
      {footer?.ctaHeading && (
        <div className="footer__cta">
          <CTAStatement
            theme="brand-purple-deep"
            statement={footer.ctaHeading}
            eyebrow={footer.ctaEyebrow ?? undefined}
            benefits={footer.ctaBenefits ?? undefined}
            cta={ctaPrimary}
            secondaryCta={ctaSecondary}
          />
        </div>
      )}

      <div className="container container--wide footer__inner">

        {/* ── Unified nav: editor-defined columns + assessment groups ── */}
        <nav className="footer__nav" aria-label="Footer navigation">
          {(footer?.linkColumns ?? []).map((col) => col?.title && (
            <div key={col.title} className="footer__nav-col">
              <span className="footer__nav-title text-label--lg color--brand">
                {col.title}
              </span>
              <ul className="footer__nav-list">
                {(col.links ?? []).map((link, i) => link?.label && link?.href && (
                  <li key={`${col.title}-${i}-${link.href}`}>
                    {renderInternalOrExternalLink(
                      link,
                      'footer__nav-link text-body--sm color--secondary',
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {groups.map((group) => (
            <div key={group.key} className="footer__nav-col">
              <span className="footer__nav-title text-label--lg color--brand">
                {group.title}
              </span>
              <ul className="footer__nav-list">
                {group.items.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/assessments/${item.slug}`}
                      className="footer__nav-link text-body--sm color--secondary"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── Contact strip: Phone / Email / Address ─────────── */}
        {(footer?.contactPhone || footer?.contactEmail || footer?.contactAddress) && (
          <div className="footer__contact">
            {footer?.contactPhone && (
              <a href={telHref(footer.contactPhone)} className="footer__contact-item">
                <span className="footer__contact-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.8 12.4 19.79 19.79 0 0 1 1.73 3.8 2 2 0 0 1 3.72 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.69a16 16 0 0 0 6.29 6.29l1.06-1.06a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <div className="footer__contact-text">
                  <span className="footer__contact-label text-label--md color--tertiary">Phone</span>
                  <span className="color--primary font--medium">{footer.contactPhone}</span>
                </div>
              </a>
            )}

            {footer?.contactEmail && (
              <a href={`mailto:${footer.contactEmail}`} className="footer__contact-item">
                <span className="footer__contact-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <div className="footer__contact-text">
                  <span className="footer__contact-label text-label--md color--tertiary">Email</span>
                  <span className="color--primary font--medium">{footer.contactEmail}</span>
                </div>
              </a>
            )}

            {footer?.contactAddress && (
              <div className="footer__contact-item">
                <span className="footer__contact-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </span>
                <div className="footer__contact-text">
                  <span className="footer__contact-label text-label--md color--tertiary">Address</span>
                  <span className="color--primary font--medium" style={{ whiteSpace: 'pre-line' }}>
                    {footer.contactAddress}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Centered brand close ──────────────────────────── */}
        <div className="footer__close">
          {(footer?.socialLinks ?? []).length > 0 && (
            <ul className="footer__social" aria-label="Social media">
              {footer?.socialLinks?.map((s) => s?.platform && s?.url && (
                <li key={`${s.platform}-${s.url}`}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer__social-link"
                    aria-label={platformLabel(s.platform)}
                  >
                    <SocialIcon platform={s.platform} />
                  </a>
                </li>
              ))}
            </ul>
          )}

          {footer?.businessText && (
            <p className="footer__close-business text-body--xs color--tertiary" style={{ whiteSpace: 'pre-line' }}>
              {footer.businessText}
            </p>
          )}

          <p className="footer__close-meta text-body--xs color--tertiary">
            <span>{copyright}</span>
            {(footer?.legalLinks ?? []).map((l, i) =>
              renderInternalOrExternalLink(l, 'footer__close-legal-link', `${l?.href ?? 'legal'}-${i}`),
            )}
            {/* Opens the vanilla-cookieconsent preferences modal — the
                library auto-binds the click via the data-cc attribute. */}
            <button
              type="button"
              data-cc="show-preferencesModal"
              className="footer__close-legal-link"
            >
              Cookie preferences
            </button>
          </p>

          {footer?.partnerLogoUrl && (
            <div className="footer__partner">
              {footer.partnerLabel && (
                <span className="text-body--sm color--tertiary">{footer.partnerLabel}</span>
              )}
              <Image
                src={footer.partnerLogoUrl}
                alt={footer.partnerLogoAlt ?? ''}
                width={160}
                height={64}
                className="footer__partner-logo"
              />
            </div>
          )}
        </div>

      </div>

      {/* ── Decorative shape fan — bottom-right corner ───── */}
      <FooterFan position="bottom-right" />
    </footer>
  );
}
