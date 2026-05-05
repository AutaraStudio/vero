import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { client } from '@/sanity/lib/client';
import {
  LEGAL_PAGE_BY_SLUG_QUERY,
  LEGAL_PAGE_SLUGS_QUERY,
  SITE_SETTINGS_QUERY,
} from '@/sanity/lib/queries';
import { generateSiteMetadata, type SiteSeoSettings } from '@/lib/seo';
import LegalDocument from './LegalDocument';

interface LegalPageData {
  _id: string;
  title: string;
  slug: string;
  intro?: string | null;
  lastUpdated?: string | null;
  body: string;
}

interface SlugRow {
  slug: string;
}

interface RouteProps {
  params: Promise<{ slug: string }>;
}

/* Statically generate one route per legalPage doc in Sanity. New docs
   added in Studio require a redeploy (or revalidate) to appear. */
export async function generateStaticParams() {
  const rows = await client.fetch<SlugRow[]>(LEGAL_PAGE_SLUGS_QUERY);
  return (rows ?? []).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const [page, settings] = await Promise.all([
    client.fetch<LegalPageData | null>(LEGAL_PAGE_BY_SLUG_QUERY, { slug }),
    client.fetch<SiteSeoSettings | null>(SITE_SETTINGS_QUERY),
  ]);
  if (!page) return {};
  return generateSiteMetadata({
    seo: {
      pageTitle: page.title,
      metaDescription: page.intro ?? undefined,
    },
    settings,
    fallback: { title: page.title, description: page.intro ?? undefined },
    path: `/legal/${page.slug}`,
  });
}

export default async function LegalRoute({ params }: RouteProps) {
  const { slug } = await params;
  const page = await client.fetch<LegalPageData | null>(LEGAL_PAGE_BY_SLUG_QUERY, { slug });
  if (!page) notFound();

  return (
    <LegalDocument
      title={page.title}
      intro={page.intro}
      lastUpdated={page.lastUpdated}
      markdown={page.body}
    />
  );
}
