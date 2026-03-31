import { BasketProvider } from '@/store/basketStore';
import ConditionalShell from './ConditionalShell';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <BasketProvider>
      <ConditionalShell>
        {children}
      </ConditionalShell>
    </BasketProvider>
  );
}
