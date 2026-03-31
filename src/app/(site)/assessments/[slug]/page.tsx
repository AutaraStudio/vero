import { notFound } from 'next/navigation';
import { sanityFetch } from '@/sanity/lib/live';
import {
  JOB_CATEGORY_BY_SLUG_QUERY,
  JOB_CATEGORY_SLUGS_QUERY,
} from '@/sanity/lib/queries';
import CategoryHero from './CategoryHero';
import DimensionsSection from './DimensionsSection';
import InActionSection from './InActionSection';
import StatsBar from './StatsBar';
import RoleRoster from './RoleRoster';
import BespokeCTA from './BespokeCTA';
import './category.css';

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const { data: slugs } = await sanityFetch({ query: JOB_CATEGORY_SLUGS_QUERY });
  return (slugs ?? []).map(({ slug }: { slug: string }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const { data: category } = await sanityFetch({
    query: JOB_CATEGORY_BY_SLUG_QUERY,
    params: { slug },
  });
  return {
    title: category?.heroHeadline ?? category?.name ?? 'Assessment',
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const { data: category } = await sanityFetch({
    query: JOB_CATEGORY_BY_SLUG_QUERY,
    params: { slug },
  });

  if (!category) notFound();

  return (
    <main>
      <CategoryHero
        heroHeadline={category.heroHeadline}
        heroIntroCopy={category.heroIntroCopy}
        keyDimensionsAssessed={category.keyDimensionsAssessed}
        slug={category.slug}
      />

      <DimensionsSection
        heading={category.dimensionsSectionHeading}
        body={category.dimensionsSectionBody}
      />

      <InActionSection
        heading={category.inActionSectionHeading}
        subheading={category.inActionSectionSubheading}
        assessmentsBlockHeading={category.assessmentsBlockHeading}
        assessmentsBlockBody={category.assessmentsBlockBody}
        portalBlockHeading={category.portalBlockHeading}
        portalBlockBody={category.portalBlockBody}
        interviewBlockHeading={category.interviewBlockHeading}
        interviewBlockBody={category.interviewBlockBody}
      />

      <StatsBar
        stat1Heading={category.stat1Heading}
        stat1Body={category.stat1Body}
        stat2Heading={category.stat2Heading}
        stat2Body={category.stat2Body}
        stat3Heading={category.stat3Heading}
        stat3Body={category.stat3Body}
      />

      <RoleRoster
        heading={category.roleRosterHeading}
        subheading={category.roleRosterSubheading}
        roles={category.roles ?? []}
        categorySlug={category.slug}
      />

      <BespokeCTA
        heading={category.bespokeSectionHeading}
        body={category.bespokeSectionBody}
        ctaLabel={category.bespokeCTALabel}
      />
    </main>
  );
}
