import { client } from '@/sanity/lib/client';
import { PRICING_PAGE_QUERY, PRICING_TIERS_QUERY } from '@/sanity/lib/queries';
import HeroCentred from '@/components/HeroCentred/HeroCentred';
import TierCardsSection from './TierCardsSection';
import ComparisonTable from './ComparisonTable';
import BespokeStrip from '@/components/BespokeStrip';
import FAQSection from '@/components/FAQSection';
import './pricing.css';

export const metadata = {
  title: 'Pricing — Vero Assess',
  description:
    'Flexible pricing for skills-based hiring assessments. Four plans for every team size, from one-off Starter packages through to Scale.',
};

export interface PricingTier {
  _id: string;
  name: string;
  slug: string;
  order: number;
  isFeatured?: boolean;
  tierLabel?: string;
  tagline?: string;
  priceDisplay?: string;
  annualPrice?: number;
  monthlyPriceDisplay?: string;
  monthlyPriceNote?: string;
  monthlyPrice?: number;
  paymentOptions?: string;
  duration?: string;
  candidateLimit?: number;
  roleLimit?: number;
  ctaLabel: string;
  ctaType: 'buy' | 'contact';
  upgradeNote?: string;
  bespokeDescription?: string;
  features?: Array<{
    label: string;
    value?: string;
    footnote?: string;
  }>;
}

interface PortableTextSpan {
  _type: 'span';
  text: string;
  marks?: string[];
}
interface PortableTextBlock {
  _type: 'block';
  children: PortableTextSpan[];
  style?: string;
}
export interface FAQItem {
  question: string;
  answer: PortableTextBlock[];
}

export interface PricingPageContent {
  heroHeadline?: string;
  heroIntro?: string;
  starterCallout?: string;
  bespokeHeading?: string;
  bespokeBody?: string;
  bespokeCtaLabel?: string;
  bespokeCtaHref?: string;
  faqHeading?: string;
  faqs?: FAQItem[];
  faqFooter?: string;
}

export default async function PricingPage() {
  const [page, tiers] = await Promise.all([
    client.fetch<PricingPageContent | null>(PRICING_PAGE_QUERY),
    client.fetch<PricingTier[]>(PRICING_TIERS_QUERY),
  ]);

  return (
    <main>
      <HeroCentred
        theme="brand-purple"
        badge={{ label: 'Pricing', href: '#pricing-tiers' }}
        headline={page?.heroHeadline ?? 'Flexible pricing'}
        intro={page?.heroIntro}
      />

      <TierCardsSection
        tiers={tiers ?? []}
        starterCallout={page?.starterCallout}
        theme="brand-purple"
      />

      <ComparisonTable tiers={tiers ?? []} theme="brand-purple" />

      <BespokeStrip
        heading={page?.bespokeHeading ?? 'Need a more customised solution?'}
        body={
          page?.bespokeBody ??
          'We also offer tailored assessments for hiring, development or training, and end-to-end solutions that take candidates from initial application through to onboarding and beyond.'
        }
        ctaLabel={page?.bespokeCtaLabel ?? 'Talk to us'}
        ctaHref={page?.bespokeCtaHref ?? '/contact'}
        theme="brand-purple"
      />

      {page?.faqs && page.faqs.length > 0 && (
        <FAQSection
          heading={page.faqHeading ?? 'Got some unanswered questions?'}
          faqs={page.faqs}
          footer={page.faqFooter}
          theme="brand-purple"
        />
      )}
    </main>
  );
}
