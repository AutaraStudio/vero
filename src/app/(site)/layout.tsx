import SmoothScroll from '@/components/SmoothScroll';
import MegaNav from '@/components/MegaNav';
import Footer from '@/components/Footer';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MegaNav />
      <SmoothScroll>
        {children}
        <Footer />
      </SmoothScroll>
    </>
  );
}
