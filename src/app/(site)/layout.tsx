import { BasketProvider } from '@/store/basketStore';
import BasketReconciler from '@/store/BasketReconciler';
import ConditionalShell from './ConditionalShell';
import Footer from '@/components/Footer/Footer';
import ComingSoonClient from '../coming-soon/ComingSoonClient';
import { SanityLive } from '@/sanity/lib/live';
import { client } from '@/sanity/lib/client';
import {
  GLOBAL_NAV_QUERY,
  GLOBAL_CATEGORY_GROUPS_QUERY,
  ALL_ROLE_IDS_QUERY,
  COMING_SOON_QUERY,
  COMING_SOON_CONTACT_QUERY,
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

interface ComingSoonData {
  enabled?: boolean;
  heading?: string;
  description?: string;
  launchDate?: string;
  formInstructions?: string;
}

interface ComingSoonContact {
  phone?: string;
  email?: string;
}

/* Same formatter as on /coming-soon. Kept inline here so the layout
   doesn't have to reach into the page module. */
function formatLaunchDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-GB', { month: 'long', day: 'numeric', timeZone: 'UTC' });
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [nav, categoryGroups, allRoleIds, comingSoon, comingSoonContact] = await Promise.all([
    client.fetch<GlobalNavData | null>(GLOBAL_NAV_QUERY),
    client.fetch<CategoryGroupsData | null>(GLOBAL_CATEGORY_GROUPS_QUERY),
    client.fetch<string[] | null>(ALL_ROLE_IDS_QUERY),
    client.fetch<ComingSoonData | null>(COMING_SOON_QUERY),
    client.fetch<ComingSoonContact | null>(COMING_SOON_CONTACT_QUERY),
  ]);

  /* Coming-soon mode replaces every public route with the holding page.
     No nav, no footer, no basket — just the ComingSoonClient. /admin/studio
     lives outside the (site) route group so the Studio is unaffected and
     editors can flip the toggle back off. */
  if (comingSoon?.enabled) {
    return (
      <ComingSoonClient
        heading={comingSoon.heading ?? 'Something new is coming'}
        description={comingSoon.description ?? null}
        launchDateLabel={formatLaunchDate(comingSoon.launchDate)}
        formInstructions={comingSoon.formInstructions ?? null}
        phone={comingSoonContact?.phone ?? null}
        email={comingSoonContact?.email ?? null}
      />
    );
  }

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
