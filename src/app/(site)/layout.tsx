import { BasketProvider } from '@/store/basketStore';
import { TransitionProvider } from '@/context/TransitionContext';
import ConditionalShell from './ConditionalShell';
import { SanityLive } from '@/sanity/lib/live';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <BasketProvider>
      <TransitionProvider>
        <ConditionalShell>
          {children}
        </ConditionalShell>
      </TransitionProvider>
      <SanityLive />
    </BasketProvider>
  );
}
