import { notFound } from 'next/navigation';
import { client } from '@/sanity/lib/client';
import { sanityFetch } from '@/sanity/lib/live';
import {
  JOB_CATEGORY_BY_SLUG_QUERY,
  JOB_CATEGORY_SLUGS_QUERY,
} from '@/sanity/lib/queries';
import HeroSplit from '@/components/HeroSplit';
import DimensionsSection from './DimensionsSection';
import FeatureCardsSection from './FeatureCardsSection';
import StatsSection from './StatsSection';
import RoleGrid from './RoleGrid';
import BespokeStrip from '@/components/BespokeStrip';
import PricingShowcase from '@/components/PricingShowcase/PricingShowcase';

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const categories: { slug: string }[] =
    await client.fetch(JOB_CATEGORY_SLUGS_QUERY);
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const { data } = await sanityFetch({ query: JOB_CATEGORY_BY_SLUG_QUERY, params: { slug } });
  return { title: data?.name ?? slug };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const { data } = await sanityFetch({ query: JOB_CATEGORY_BY_SLUG_QUERY, params: { slug } });

  if (!data) notFound();

  const {
    heroHeadline,
    heroIntroCopy,
    keyDimensionsAssessed,
    heroImageUrl,
    dimensionsSectionHeading,
    dimensionsSectionBody,
    dimensionsSectionImage,
    inActionLabel,
    inActionHeading,
    inActionIntro,
    featureCardsHeading,
    featureCardsSubheading,
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
    bespokeSectionHeading,
    bespokeSectionBody,
    bespokeCTALabel,
    bespokeCTAHref,
    bespokeSectionImage,
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
    <main>
      <HeroSplit
        theme="brand-purple"
        eyebrow="Assessment"
        headline={heroHeadline}
        intro={heroIntroCopy}
        badges={dimensionBadges}
        primaryCTA={{ label: 'Get started', href: `/get-started?category=${slug}` }}
        image={
          heroImageUrl
            ? { src: heroImageUrl, alt: heroHeadline }
            : undefined
        }
        imageHeight="viewport"
        textAlign="bottom"
      />

      {dimensionsSectionHeading && (
        <DimensionsSection
          heading={dimensionsSectionHeading}
          body={dimensionsSectionBody}
          imageUrl={dimensionsSectionImage?.asset?.url}
        />
      )}

      {((featureCards && featureCards.length > 0) || featureCardsHeading) && (
        <FeatureCardsSection
          sectionLabel={inActionLabel}
          sectionHeading={inActionHeading}
          sectionIntro={inActionIntro}
          leadHeading={featureCardsHeading}
          leadBody={featureCardsSubheading}
          cards={featureCards ?? []}
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

      {bespokeSectionHeading && (
        <BespokeStrip
          heading={bespokeSectionHeading}
          body={bespokeSectionBody}
          ctaLabel={bespokeCTALabel || "Interested? Let's talk"}
          ctaHref={bespokeCTAHref || '/contact'}
          image={
            bespokeSectionImage?.asset?.url
              ? {
                  src: bespokeSectionImage.asset.url,
                  alt: 'Vero Assess platform preview',
                }
              : undefined
          }
        />
      )}
    </main>
  );
}
