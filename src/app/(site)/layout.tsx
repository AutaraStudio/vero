import { BasketProvider } from '@/store/basketStore';
import ConditionalShell from './ConditionalShell';
import { SanityLive } from '@/sanity/lib/live';
import { client } from '@/sanity/lib/client';
import { SITE_SETTINGS_QUERY } from '@/sanity/lib/queries';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await client.fetch(SITE_SETTINGS_QUERY);

  return (
    <BasketProvider>
      <ConditionalShell
        navCtaLabel={settings?.navCtaLabel}
        navCtaHref={settings?.navCtaHref}
      >
        {children}
      </ConditionalShell>
      <SanityLive />
    </BasketProvider>
  );
}
