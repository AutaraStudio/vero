import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { COMING_SOON_QUERY, COMING_SOON_CONTACT_QUERY } from '@/sanity/lib/queries';
import ComingSoonClient from './ComingSoonClient';

export const metadata: Metadata = {
  title: 'Coming soon — Vero Assess',
  description: 'Vero Assess is launching soon. Get in touch.',
  robots: { index: false, follow: false },
};

interface ComingSoonData {
  enabled?: boolean;
  heading?: string;
  description?: string;
  launchDate?: string;
  formInstructions?: string;
}

interface ContactDetails {
  phone?: string;
  email?: string;
}

/* Format a Sanity date ("YYYY-MM-DD") as "Month Day" — e.g. "May 26".
   Uses UTC to avoid local-timezone shifts that could turn the chosen
   day into the day before for negative offsets. */
function formatLaunchDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-GB', { month: 'long', day: 'numeric', timeZone: 'UTC' });
}

export default async function ComingSoonPage() {
  const [data, contact] = await Promise.all([
    client.fetch<ComingSoonData | null>(COMING_SOON_QUERY),
    client.fetch<ContactDetails | null>(COMING_SOON_CONTACT_QUERY),
  ]);

  return (
    <ComingSoonClient
      heading={data?.heading ?? 'Something new is coming'}
      description={data?.description ?? null}
      launchDateLabel={formatLaunchDate(data?.launchDate)}
      formInstructions={data?.formInstructions ?? null}
      phone={contact?.phone ?? null}
      email={contact?.email ?? null}
    />
  );
}
