import type { Metadata } from 'next';
import Link from 'next/link';
import { EditIcon, DocumentTextIcon, ArrowRightIcon, EarthGlobeIcon } from '@sanity/icons';

import styles from './admin-landing.module.css';

/**
 * /admin — landing page for internal/client-facing operational tools.
 *
 * Two primary tiles: Sanity Studio + content editor guide. Plus quick
 * links to the live and staging URLs and a status badge showing which
 * dataset this admin is wired to.
 *
 * Sits outside the public (site) route group and is excluded from
 * search-engine indexing via the layout metadata + robots.txt.
 *
 * Uses data-theme="dark" because admin work isn't a public marketing
 * surface — a darker, calmer canvas reads as "operational" without
 * having to invent any one-off palette.
 */

export const metadata: Metadata = {
  title: 'Admin — Vero Assess',
  description: 'Internal admin area. Not indexed.',
};

export default function AdminLandingPage() {
  /* Read at request time on the server so the badge reflects the build's
     actual dataset. NEXT_PUBLIC_* is inlined at build time, so this is
     deterministic per Netlify deploy context. */
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'unknown';
  const isProduction = dataset === 'production';

  return (
    <main data-theme="dark" className={styles.shell}>
      <header className={styles.topbar}>
        <Link href="/admin" className={styles.brand}>
          <span className={styles.brandMark} aria-hidden>VA</span>
          <span className={styles.brandName}>Vero Assess</span>
          <span className={styles.brandSuffix}>· admin</span>
        </Link>
        <span className={styles.envBadge} title={`Connected dataset: ${dataset}`}>
          <span
            className={`${styles.envDot} ${isProduction ? styles.envDotProd : ''}`}
            aria-hidden
          />
          {dataset}
        </span>
      </header>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>Internal — not indexed</p>
        <h1 className={styles.title}>
          Welcome to the Vero Assess admin.
        </h1>
        <p className={styles.subtitle}>
          Edit website content, preview changes on staging, and push them
          live when you&rsquo;re ready. Everything you need to manage the
          site is on this one screen.
        </p>
      </section>

      <nav className={styles.grid} aria-label="Admin tools">
        <Link href="/admin/studio" className={`${styles.tile} ${styles.tilePrimary}`}>
          <span className={styles.tileIcon} aria-hidden>
            <EditIcon />
          </span>
          <h2 className={styles.tileHeading}>Sanity Studio</h2>
          <p className={styles.tileBody}>
            Edit pages, roles, pricing tiers, legal pages and global site
            settings. Publish to staging, then push to live when ready.
          </p>
          <span className={styles.tileCta}>
            Open Studio
            <span className={styles.tileCtaArrow} aria-hidden><ArrowRightIcon /></span>
          </span>
        </Link>

        <Link href="/admin/guide" className={`${styles.tile} ${styles.tileSecondary}`}>
          <span className={styles.tileIcon} aria-hidden>
            <DocumentTextIcon />
          </span>
          <h2 className={styles.tileHeading}>Content guide</h2>
          <p className={styles.tileBody}>
            Step-by-step manual covering how to edit pages, manage media,
            handle SEO and publish changes. Bookmark for reference.
          </p>
          <span className={styles.tileCta}>
            Read the guide
            <span className={styles.tileCtaArrow} aria-hidden><ArrowRightIcon /></span>
          </span>
        </Link>
      </nav>

      <div className={styles.quickLinks}>
        <a
          className={styles.quickLink}
          href="https://www.veroassess.com"
          target="_blank"
          rel="noreferrer"
        >
          <span className={styles.quickLinkLabel}>
            <EarthGlobeIcon style={{ verticalAlign: '-0.125em', marginRight: '0.25rem' }} />
            Live site
          </span>
          <span className={styles.quickLinkUrl}>www.veroassess.com</span>
        </a>
        <a
          className={styles.quickLink}
          href="https://staging--vero-assess-staging.netlify.app"
          target="_blank"
          rel="noreferrer"
        >
          <span className={styles.quickLinkLabel}>
            <EarthGlobeIcon style={{ verticalAlign: '-0.125em', marginRight: '0.25rem' }} />
            Staging preview
          </span>
          <span className={styles.quickLinkUrl}>
            staging--vero-assess-staging.netlify.app
          </span>
        </a>
      </div>

      <footer className={styles.footnote}>
        <span>Internal tools. Not visible to the public.</span>
        <span aria-hidden>·</span>
        <span>Need help? Contact your developer.</span>
      </footer>
    </main>
  );
}
