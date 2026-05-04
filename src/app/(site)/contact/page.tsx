import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { CONTACT_PAGE_QUERY, SITE_SETTINGS_QUERY } from '@/sanity/lib/queries';
import { generateSiteMetadata, type PageSeo, type SiteSeoSettings } from '@/lib/seo';
import FAQSection, { type FAQItem } from '@/components/FAQSection';
import ContactForm from '@/components/ContactForm';
import ContactHero from './ContactHero';
import ContactMethods from './ContactMethods';
import './contact.css';

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([
    client.fetch<{ seo?: PageSeo; heroHeadline?: string; heroIntro?: string } | null>(CONTACT_PAGE_QUERY),
    client.fetch<SiteSeoSettings | null>(SITE_SETTINGS_QUERY),
  ]);
  return generateSiteMetadata({
    seo: page?.seo,
    settings,
    fallback: {
      title:       page?.heroHeadline ?? 'Contact us',
      description: page?.heroIntro ??
        "Get in touch with the Vero Assess team. Phone, email, contact form. We're happy to chat about how we can support your hiring.",
    },
    path: '/contact',
  });
}

interface ContactPageData {
  heroHeadline?: string;
  heroIntro?: string;
  contactInstructions?: string;
  phone?: string;
  email?: string;

  faqHeading?: string;
  faqs?: FAQItem[];
  faqFooter?: string;
}

export default async function ContactPage() {
  const data = await client.fetch<ContactPageData | null>(CONTACT_PAGE_QUERY);

  return (
    <main>
      {/* ── 1. Hero — text only, sets up the page ──────────── */}
      <ContactHero
        headline={data?.heroHeadline ?? 'Get in touch'}
        intro={data?.heroIntro}
      />

      {/* ── 2. Contact section — form on the left, methods on the right ── */}
      <section data-theme="brand-purple" className="contact-section section">
        <div className="container">
          <div className="contact-section__grid">

            <div className="contact-section__form">
              <header className="contact-section__form-header stack--md">
                <h2 className="text-h3 color--primary">Send us a message</h2>
                {data?.contactInstructions && (
                  <p className="text-body--md color--secondary leading--snug">
                    {data.contactInstructions}
                  </p>
                )}
              </header>
              <ContactForm />
            </div>

            <ContactMethods phone={data?.phone} email={data?.email} />

          </div>
        </div>
      </section>

      {/* ── 3. FAQ section (shared with /pricing) ─────────── */}
      {data?.faqs && data.faqs.length > 0 && (
        <FAQSection
          theme="brand-purple"
          heading={data.faqHeading ?? 'Frequently asked questions'}
          faqs={data.faqs}
          footer={data.faqFooter}
        />
      )}

      {/* Closing CTA is global — handled by Footer */}
    </main>
  );
}
