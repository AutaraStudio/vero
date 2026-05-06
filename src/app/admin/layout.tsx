import type { Metadata } from 'next';

/**
 * /admin layout — internal-only routes.
 *
 * Sits OUTSIDE the (site) route group so the public site's nav, footer
 * and global chrome don't appear here. Each child page (Studio, guide,
 * landing) brings its own UI.
 *
 * Indexing is blocked at the metadata level here (defence in depth)
 * AND at the crawler level via /robots.txt.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
