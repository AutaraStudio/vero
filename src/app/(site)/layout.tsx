import { BasketProvider } from '@/store/basketStore';
import ConditionalShell from './ConditionalShell';
import { SanityLive } from '@/sanity/lib/live';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <BasketProvider>
      <ConditionalShell>
        {children}
      </ConditionalShell>
      <SanityLive />
    </BasketProvider>
  );
}
