import type { Metadata } from 'next';
import './globals.css';
import './utilities.css';
import SmoothScroll from '@/components/SmoothScroll';
import MegaNav from '@/components/MegaNav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Vero Assess',
  description: 'Identify authentic talent. Make strategic hiring decisions.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MegaNav />
        <SmoothScroll>
          {children}
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
