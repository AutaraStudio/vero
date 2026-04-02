'use client';
import { usePathname } from 'next/navigation';
import ProgressBar from './ProgressBar';

export default function ConditionalProgressBar() {
  const pathname = usePathname();
  const HIDDEN = ['/get-started/confirmation', '/get-started/bespoke'];
  if (HIDDEN.includes(pathname)) return null;
  return <ProgressBar />;
}
