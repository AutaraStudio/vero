import type { Metadata } from 'next';
import './globals.css';
import './utilities.css';

export const metadata: Metadata = {
  title: 'Vero Assess',
  description: 'Identify authentic talent. Make strategic hiring decisions.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
