import Hero from '@/components/Hero';
import USPSlider from '@/components/USPSlider';
import HowItWorks from '@/components/HowItWorks';
import Pricing from '@/components/Pricing';
import { sanityFetch } from '@/sanity/lib/live';
import { HOME_PAGE_QUERY } from '@/sanity/lib/queries';

export default async function Home() {
  const { data: homePage } = await sanityFetch({ query: HOME_PAGE_QUERY });

  return (
    <main>
      <Hero
        title={homePage?.heroTitle}
        intro={homePage?.heroIntro}
        ctaLabel={homePage?.heroCTALabel}
      />
      <USPSlider />
      <HowItWorks
        heading={homePage?.howItWorksHeading}
        intro={homePage?.howItWorksIntro}
        steps={homePage?.steps}
      />
      <Pricing />
    </main>
  );
}
