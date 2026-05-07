import { BasketProvider } from '@/store/basketStore';
import BasketReconciler from '@/store/BasketReconciler';
import ConditionalShell from './ConditionalShell';
import Footer from '@/components/Footer/Footer';
import { SanityLive } from '@/sanity/lib/live';
import { client } from '@/sanity/lib/client';
import {
  GLOBAL_NAV_QUERY,
  GLOBAL_CATEGORY_GROUPS_QUERY,
  ALL_ROLE_IDS_QUERY,
} from '@/sanity/lib/queries';
import type {
  NavTopItem,
  NavColumn,
  NavCompanyCard,
  NavCategoryGroup,
} from '@/components/MegaNav/MegaNav';

interface GlobalNavData {
  topItems?: NavTopItem[] | null;
  companyColumns?: NavColumn[] | null;
  companyCard?: NavCompanyCard | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
}

interface CategoryGroupsData {
  groups?: NavCategoryGroup[] | null;
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [nav, categoryGroups, allRoleIds] = await Promise.all([
    client.fetch<GlobalNavData | null>(GLOBAL_NAV_QUERY),
    client.fetch<CategoryGroupsData | null>(GLOBAL_CATEGORY_GROUPS_QUERY),
    client.fetch<string[] | null>(ALL_ROLE_IDS_QUERY),
  ]);

  return (
    <BasketProvider>
      <BasketReconciler validRoleIds={allRoleIds ?? []} />
      <ConditionalShell
        topItems={nav?.topItems ?? []}
        companyColumns={nav?.companyColumns ?? []}
        companyCard={nav?.companyCard ?? null}
        ctaLabel={nav?.ctaLabel ?? 'Get started'}
        ctaHref={nav?.ctaHref ?? '/get-started'}
        categoryGroups={categoryGroups?.groups ?? []}
        footer={<Footer />}
      >
        {children}
      </ConditionalShell>
      <SanityLive />
    </BasketProvider>
  );
}
