'use client';

import { usePathname } from 'next/navigation';
import MegaNav from '@/components/MegaNav';
import SmoothScroll from '@/components/SmoothScroll';
import type { NavCategory } from '@/components/MegaNav/MegaNav';

interface ConditionalShellProps {
  children: React.ReactNode;
  navCtaLabel?: string;
  navCtaHref?: string;
  categories?: NavCategory[];
}

export default function ConditionalShell({ children, navCtaLabel, navCtaHref, categories = [] }: ConditionalShellProps) {
  const pathname = usePathname();
  const isCheckout = pathname.startsWith('/get-started');

  if (isCheckout) {
    return <>{children}</>;
  }

  return (
    <>
      <MegaNav navCtaLabel={navCtaLabel} navCtaHref={navCtaHref} categories={categories} />
      <SmoothScroll>
        {children}
      </SmoothScroll>
    </>
  );
}
