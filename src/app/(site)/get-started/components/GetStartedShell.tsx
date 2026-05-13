import type { ReactNode } from 'react';
import type { ThemeVariant } from '@/lib/theme';
import CheckoutFan from './CheckoutFan';

interface GetStartedShellProps {
  theme: ThemeVariant;
  children: ReactNode;
}

export default function GetStartedShell({ theme, children }: GetStartedShellProps) {
  return (
    <div className="get-started-shell" data-theme={theme}>
      {children}
      <CheckoutFan />
    </div>
  );
}
