'use client';

import { usePathname } from 'next/navigation';
import MegaNav from '@/components/MegaNav';
import SmoothScroll from '@/components/SmoothScroll';
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
      </SmoothScroll>
    </>
  );
}
