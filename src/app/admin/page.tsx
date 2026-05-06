import type { Metadata } from 'next';
import Link from 'next/link';

/**
 * /admin — landing page for internal/client-facing operational tools.
 *
 * Two tiles: open Sanity Studio, or read the content editor guide.
 * Sits outside the public (site) route group and is excluded from
 * search-engine indexing via the layout metadata + robots.txt.
 */
export const metadata: Metadata = {
  title: 'Admin — Vero Assess',
  description: 'Internal admin area. Not indexed.',
};

export default function AdminLandingPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
        background: 'var(--color--page-bg)',
        color: 'var(--color--text-primary)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '40rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color--text-tertiary)',
              margin: 0,
            }}
          >
            Vero Assess
          </p>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0.25rem 0 0' }}>
            Admin
          </h1>
          <p style={{ color: 'var(--color--text-secondary)', marginTop: '0.5rem' }}>
            Internal tools for editing the website. Not visible to the public.
          </p>
        </header>

        <nav style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
          <Link
            href="/admin/studio"
            style={{
              display: 'block',
              padding: '1.5rem',
              background: 'var(--color--surface-raised)',
              border: '1px solid var(--color--border-default)',
              borderRadius: 'var(--radius--lg)',
              color: 'var(--color--text-primary)',
              textDecoration: 'none',
            }}
          >
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
              Sanity Studio
            </h2>
            <p
              style={{
                color: 'var(--color--text-secondary)',
                margin: '0.5rem 0 0',
                fontSize: '0.875rem',
              }}
            >
              Edit pages, roles, pricing and other content.
            </p>
          </Link>

          <Link
            href="/admin/guide"
            style={{
              display: 'block',
              padding: '1.5rem',
              background: 'var(--color--surface-raised)',
              border: '1px solid var(--color--border-default)',
              borderRadius: 'var(--radius--lg)',
              color: 'var(--color--text-primary)',
              textDecoration: 'none',
            }}
          >
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
              Content guide
            </h2>
            <p
              style={{
                color: 'var(--color--text-secondary)',
                margin: '0.5rem 0 0',
                fontSize: '0.875rem',
              }}
            >
              Reference manual for editing content and publishing changes.
            </p>
          </Link>
        </nav>
      </div>
    </main>
  );
}
