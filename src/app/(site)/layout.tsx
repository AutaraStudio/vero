import { BasketProvider } from '@/store/basketStore';
import ConditionalShell from './ConditionalShell';
import Footer from '@/components/Footer/Footer';
import { SanityLive } from '@/sanity/lib/live';
import { client } from '@/sanity/lib/client';
import { SITE_SETTINGS_QUERY, NAV_CATEGORIES_QUERY } from '@/sanity/lib/queries';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([
    client.fetch(SITE_SETTINGS_QUERY),
    client.fetch(NAV_CATEGORIES_QUERY),
  ]);

  return (
    <BasketProvider>
      <ConditionalShell
        navCtaLabel={settings?.navCtaLabel}
        navCtaHref={settings?.navCtaHref}
        categories={categories ?? []}
        footer={<Footer />}
      >
        {children}
      </ConditionalShell>
      <SanityLive />
    </BasketProvider>
  );
}
