import { client } from '@/sanity/lib/client';
import { sanityFetch } from '@/sanity/lib/live';
import {
  JOB_CATEGORY_BY_SLUG_QUERY,
  JOB_CATEGORY_SLUGS_QUERY,
} from '@/sanity/lib/queries';
import DetailHero from './DetailHero';
import DimensionsSection from './DimensionsSection';
import InActionSection from './InActionSection';
import StatsSection from './StatsSection';
import RoleGrid from './RoleGrid';
import BespokeSection from './BespokeSection';

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

  if (!data) return <main></main>;

  const {
    heroHeadline,
    heroIntroCopy,
    keyDimensionsAssessed,
    heroImageUrl,
    dimensionsSectionHeading,
    dimensionsSectionBody,
    dimensionsSectionImage,
    inActionSectionHeading,
    inActionSectionSubheading,
    assessmentsBlockHeading,
    assessmentsBlockBody,
    portalBlockHeading,
    portalBlockBody,
    interviewBlockHeading,
    interviewBlockBody,
    stat1Heading,
    stat1Body,
    stat2Heading,
    stat2Body,
    stat3Heading,
    stat3Body,
    roles,
    name,
    roleRosterHeading,
    roleRosterSubheading,
    bespokeSectionHeading,
    bespokeSectionBody,
    bespokeCTALabel,
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

  return (
    <main>
      <DetailHero
        heroHeadline={heroHeadline}
        heroIntroCopy={heroIntroCopy}
        keyDimensionsAssessed={keyDimensionsAssessed}
        slug={slug}
        heroImageUrl={heroImageUrl}
      />

      {dimensionsSectionHeading && (
        <DimensionsSection
          heading={dimensionsSectionHeading}
          body={dimensionsSectionBody}
          imageUrl={dimensionsSectionImage?.asset?.url}
        />
      )}

      {inActionSectionHeading && (
        <InActionSection
          sectionHeading={inActionSectionHeading}
          sectionSubheading={inActionSectionSubheading}
          assessmentsHeading={assessmentsBlockHeading}
          assessmentsBody={assessmentsBlockBody}
          portalHeading={portalBlockHeading}
          portalBody={portalBlockBody}
          interviewHeading={interviewBlockHeading}
          interviewBody={interviewBlockBody}
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

      {bespokeSectionHeading && (
        <BespokeSection
          heading={bespokeSectionHeading}
          body={bespokeSectionBody}
          ctaLabel={bespokeCTALabel || "Interested? Let's talk"}
          imageUrl={bespokeSectionImage?.asset?.url}
        />
      )}
    </main>
  );
}
