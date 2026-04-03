import type { ReactNode } from 'react';
import type { ThemeVariant } from '@/lib/theme';
import './FixedBar.css';

export interface FixedBarProps {
  theme?: ThemeVariant;
  children: ReactNode;
  className?: string;
}

export default function FixedBar({ theme = 'brand-purple', children, className }: FixedBarProps) {
  return (
    <div className={`fixed-bar${className ? ` ${className}` : ''}`} data-theme={theme}>
      <div className="container">
        <div className="fixed-bar__inner">
          {children}
        </div>
      </div>
    </div>
  );
}
