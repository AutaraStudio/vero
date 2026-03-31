'use client';

import { usePathname } from 'next/navigation';
import MegaNav from '@/components/MegaNav';
import Footer from '@/components/Footer';
import SmoothScroll from '@/components/SmoothScroll';
import { SanityLive } from '@/sanity/lib/live';

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCheckout = pathname.startsWith('/get-started');

  if (isCheckout) {
    return <>{children}</>;
  }

  return (
    <>
      <MegaNav />
      <SmoothScroll>
        {children}
        <Footer />
      </SmoothScroll>
      <SanityLive />
    </>
  );
}
