import type { Metadata } from 'next';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import ManageGuide from './ManageGuide';
import './manage.css';

/**
 * Internal client-facing guide for editing content in Sanity Studio.
 *
 * - Hosted at /guides/manage so the URL is easy to share with the client
 * - generateMetadata returns robots: { index: false, follow: false } so it
 *   never appears in search results
 * - Also blocked at the crawler level via robots.txt (defence in depth)
 *
 * Source-of-truth content is docs/client-manual.md — read at build time
 * and rendered by react-markdown. Editing the markdown re-deploys the page.
 */
export const metadata: Metadata = {
  title: 'Content editor guide — Vero Assess (internal)',
  description: 'Internal guide for editing the Vero Assess website. Not indexed.',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default async function ManagePage() {
  const filePath = path.join(process.cwd(), 'docs', 'client-manual.md');
  const markdown = await readFile(filePath, 'utf8');
  return <ManageGuide markdown={markdown} />;
}
