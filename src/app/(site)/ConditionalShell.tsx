'use client';

import { usePathname } from 'next/navigation';
import MegaNav from '@/components/MegaNav';
import SmoothScroll from '@/components/SmoothScroll';

interface ConditionalShellProps {
  children: React.ReactNode;
  navCtaLabel?: string;
  navCtaHref?: string;
}

export default function ConditionalShell({ children, navCtaLabel, navCtaHref }: ConditionalShellProps) {
  const pathname = usePathname();
  const isCheckout = pathname.startsWith('/get-started');

  if (isCheckout) {
    return <>{children}</>;
  }

  return (
    <>
      <MegaNav navCtaLabel={navCtaLabel} navCtaHref={navCtaHref} />
      <SmoothScroll>
        {children}
      </SmoothScroll>
    </>
  );
}
