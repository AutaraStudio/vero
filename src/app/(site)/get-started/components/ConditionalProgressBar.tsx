'use client';
import { usePathname } from 'next/navigation';
import ProgressBar from './ProgressBar';

export default function ConditionalProgressBar() {
  const pathname = usePathname();
  if (pathname === '/get-started/confirmation') return null;
  return <ProgressBar />;
}
