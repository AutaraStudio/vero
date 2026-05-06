'use client';

import { usePathname } from 'next/navigation';
import MegaNav from '@/components/MegaNav';
import SmoothScroll from '@/components/SmoothScroll';
import type {
  NavTopItem,
  NavColumn,
  NavCompanyCard,
  NavCategoryGroup,
} from '@/components/MegaNav/MegaNav';

interface ConditionalShellProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  topItems?: NavTopItem[];
  companyColumns?: NavColumn[];
  companyCard?: NavCompanyCard | null;
  ctaLabel?: string;
  ctaHref?: string;
  categoryGroups?: NavCategoryGroup[];
}

export default function ConditionalShell({
  children,
  footer,
  topItems = [],
  companyColumns = [],
  companyCard = null,
  ctaLabel = 'Get started',
  ctaHref = '/get-started',
  categoryGroups = [],
}: ConditionalShellProps) {
  const pathname = usePathname();
  const isCheckout = pathname.startsWith('/get-started');

  if (isCheckout) {
    return <>{children}</>;
  }

  return (
    <>
      <MegaNav
        topItems={topItems}
        companyColumns={companyColumns}
        companyCard={companyCard}
        ctaLabel={ctaLabel}
        ctaHref={ctaHref}
        categoryGroups={categoryGroups}
      />
      <SmoothScroll>
        {children}
        {footer}
      </SmoothScroll>
    </>
  );
}
