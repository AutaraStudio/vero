import { client } from '@/sanity/lib/client';
import {
  JOB_CATEGORY_BY_SLUG_QUERY,
  JOB_CATEGORY_SLUGS_QUERY,
} from '@/sanity/lib/queries';
import DetailHero from './DetailHero';
import RoleGrid from './RoleGrid';

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

  const {
    heroHeadline,
    heroIntroCopy,
    keyDimensionsAssessed,
    heroImageUrl,
    roles,
    name,
    roleRosterHeading,
    roleRosterSubheading,
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
      {rolesWithLottieData?.length > 0 && (
        <RoleGrid
          roles={rolesWithLottieData}
          categoryName={name}
          categorySlug={slug}
          heading={roleRosterHeading || `${name} roles`}
          subheading={roleRosterSubheading || 'Select the roles you want to assess. Click to add them to your basket.'}
        />
      )}
    </main>
  );
}
