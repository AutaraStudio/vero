import type { ReactNode } from 'react';
import type { ThemeVariant } from '@/lib/theme';
import PlanBar from './PlanBar';

interface GetStartedShellProps {
  theme: ThemeVariant;
  children: ReactNode;
}

export default function GetStartedShell({ theme, children }: GetStartedShellProps) {
  return (
    <div className="get-started-shell" data-theme={theme}>
      {children}
      <PlanBar theme={theme} />
    </div>
  );
}
