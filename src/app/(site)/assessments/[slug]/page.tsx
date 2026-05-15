import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { client } from '@/sanity/lib/client';
import { sanityFetch } from '@/sanity/lib/live';
import {
  JOB_CATEGORY_BY_SLUG_QUERY,
  JOB_CATEGORY_SLUGS_QUERY,
  SITE_SETTINGS_QUERY,
} from '@/sanity/lib/queries';
import { generateSiteMetadata, type PageSeo, type SiteSeoSettings } from '@/lib/seo';
import type { MediaBlockData } from '@/components/MediaBlock';
import HeroSplit from '@/components/HeroSplit';
import ContentSection from '@/components/ContentSection';
import FeatureCardsSection from './FeatureCardsSection';
import StatsSection from './StatsSection';
import RoleGrid from './RoleGrid';
import PricingShowcase from '@/components/PricingShowcase/PricingShowcase';

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const categories: { slug: string }[] =
    await client.fetch(JOB_CATEGORY_SLUGS_QUERY);
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const [{ data }, settings] = await Promise.all([
    sanityFetch({ query: JOB_CATEGORY_BY_SLUG_QUERY, params: { slug } }),
    client.fetch<SiteSeoSettings | null>(SITE_SETTINGS_QUERY),
  ]);
  const page = data as
    | { seo?: PageSeo; name?: string; heroHeadline?: string; heroIntroCopy?: string; heroMedia?: MediaBlockData }
    | null;
  const heroFallbackImage =
    page?.heroMedia?.type === 'video'
      ? page?.heroMedia?.videoThumbnailUrl
      : page?.heroMedia?.imageUrl;
  return generateSiteMetadata({
    seo: page?.seo,
    settings,
    fallback: {
      title:       page?.heroHeadline ?? page?.name ?? slug,
      description: page?.heroIntroCopy,
      imageUrl:    heroFallbackImage ?? undefined,
    },
    path: `/assessments/${slug}`,
  });
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const { data } = await sanityFetch({ query: JOB_CATEGORY_BY_SLUG_QUERY, params: { slug } });

  if (!data) notFound();

  const {
    heroHeadline,
    heroIntroCopy,
    keyDimensionsAssessed,
    heroMedia,
    dimensionsSectionContent,
    inActionLabel,
    inActionHeading,
    inActionIntro,
    featureCards,
    stat1Heading,
    stat1Body,
    stat2Heading,
    stat2Body,
    stat3Heading,
    stat3Body,
    stat4Heading,
    stat4Body,
    roles,
    name,
    roleRosterHeading,
    roleRosterSubheading,
    bespokeSectionContent,
  } = data;

  // Pre-fetch Lottie JSON data server-side so the client doesn't need to
  const rolesWithLottieData = roles
    ? await Promise.all(
        roles.map(async (role: { lottieUrl?: string; [key: string]: unknown }) => {
          if (!role.lottieUrl) return role;
          try {
            const res = await fetch(role.lottieUrl);
            const lottieData = await res.json();
            return { ...role, lottieData };
          } catch {
            return role;
          }
        })
      )
    : [];

  const dimensionBadges = keyDimensionsAssessed
    ? keyDimensionsAssessed
        .split(',')
        .map((d: string) => d.trim())
        .filter(Boolean)
    : [];

  return (
    <main id="main-content" tabIndex={-1}>
      <HeroSplit
        theme="brand-purple"
        layout="stacked"
        eyebrow="Assessments"
        headline={heroHeadline}
        intro={heroIntroCopy}
        badges={dimensionBadges}
        primaryCTA={{ label: 'Get started', href: `/get-started?category=${slug}` }}
        media={heroMedia}
      />

      <ContentSection theme="brand-purple" section={dimensionsSectionContent} />

      {featureCards && featureCards.length > 0 && (
        <FeatureCardsSection
          sectionLabel={inActionLabel}
          sectionHeading={inActionHeading}
          sectionIntro={inActionIntro}
          cards={featureCards}
        />
      )}

      {stat1Heading && (
        <StatsSection
          stat1Heading={stat1Heading}
          stat1Body={stat1Body}
          stat2Heading={stat2Heading}
          stat2Body={stat2Body}
          stat3Heading={stat3Heading}
          stat3Body={stat3Body}
          stat4Heading={stat4Heading}
          stat4Body={stat4Body}
        />
      )}

      {rolesWithLottieData?.length > 0 && (
        <RoleGrid
          roles={rolesWithLottieData}
          categoryName={name}
          categorySlug={slug}
          heading={roleRosterHeading || `${name} roles`}
          subheading={roleRosterSubheading || 'Select the roles you want to assess. Click to add them to your basket.'}
        />
      )}

      {/* Pricing tiers + collapsible comparison table — same on every assessment page */}
      <PricingShowcase collapsible />

      <ContentSection theme="brand-purple" section={bespokeSectionContent} />
    </main>
  );
}
