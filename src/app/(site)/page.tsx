import { client } from '@/sanity/lib/client';
import { HOME_PAGE_QUERY } from '@/sanity/lib/queries';
import HeroCentred from '@/components/HeroCentred/HeroCentred';
import FeaturedSlider from '@/components/FeaturedSlider/FeaturedSlider';
import StepsSection from '@/components/StepsSection/StepsSection';
import CTAStatement from '@/components/CTAStatement/CTAStatement';

export default async function Home() {
  const data = await client.fetch(HOME_PAGE_QUERY);

  const badge =
    data?.heroBadgeLabel
      ? { label: data.heroBadgeLabel, href: data.heroBadgeHref ?? '#' }
      : undefined;

  const media = (() => {
    if (data?.heroMediaType === 'video' && data.heroVideoUrl) {
      return {
        type: 'video' as const,
        thumbnailSrc: data.heroVideoThumbnailUrl ?? '',
        videoSrc: data.heroVideoUrl,
      };
    }
    return {
      type: 'image' as const,
      src: data?.heroImageUrl ?? '/images/hero-placeholder.png',
      alt: data?.heroImageAlt ?? 'Vero Assess platform preview',
    };
  })();

  return (
    <main>
      <HeroCentred
        theme="brand-orange"
        badge={badge}
        headline={data?.heroTitle ?? 'Hire the right people, every time.'}
        intro={data?.heroIntro ?? 'Science-backed skills assessments built for modern hiring teams. Objective, fast, and fair.'}
        primaryCTA={{
          label: data?.heroCTALabel ?? 'Get started',
          href:  data?.heroCTAHref  ?? '/get-started',
        }}
        secondaryCTA={
          data?.heroSecondaryCTALabel
            ? { label: data.heroSecondaryCTALabel, href: data.heroSecondaryCTAHref ?? '#' }
            : { label: 'See how it works', href: '/how-it-works' }
        }
        media={media}
      />

      {data?.usps?.length > 0 && (
        <FeaturedSlider
          theme=""
          sectionLabel={data.uspsSectionLabel}
          heading={data.uspsSectionHeading}
          intro={data.uspsSectionSubheading}
          usps={data.usps}
        />
      )}

      <StepsSection
        theme=""
        heading={data?.howItWorksHeading}
        intro={data?.howItWorksIntro}
        steps={data?.steps}
      />

      <CTAStatement
        theme="brand-purple"
      />
    </main>
  );
}
