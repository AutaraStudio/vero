import { client } from '@/sanity/lib/client';
import {
  JOB_CATEGORY_BY_SLUG_QUERY,
  JOB_CATEGORY_SLUGS_QUERY,
} from '@/sanity/lib/queries';
import DetailHero from './DetailHero';

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const categories: { slug: string }[] =
    await client.fetch(JOB_CATEGORY_SLUGS_QUERY);
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const data = await client.fetch(JOB_CATEGORY_BY_SLUG_QUERY, { slug });
  return { title: data?.name ?? slug };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const data = await client.fetch(JOB_CATEGORY_BY_SLUG_QUERY, { slug });

  if (!data) return <main></main>;

  const { heroHeadline, heroIntroCopy, keyDimensionsAssessed, heroImageUrl } =
    data;

  return (
    <main>
      <DetailHero
        heroHeadline={heroHeadline}
        heroIntroCopy={heroIntroCopy}
        keyDimensionsAssessed={keyDimensionsAssessed}
        slug={slug}
        heroImageUrl={heroImageUrl}
      />
    </main>
  );
}
