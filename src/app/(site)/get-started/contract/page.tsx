import { client } from '@/sanity/lib/client';
import { SITE_SETTINGS_QUERY } from '@/sanity/lib/queries';
import ContractClient from './ContractClient';

/* Hardcoded fallbacks — used when siteSettings has no override. Lets the
   page keep working even if Sanity is mid-edit or the fields are blank. */
const FALLBACK_STARTER_URL =
  'https://25935419.fs1.hubspotusercontent-eu1.net/hubfs/25935419/Vero%20Assess/Terms%20and%20Conditions/Vero%20Assess%20Single%20Role%20Starter%20Plan%20Terms%20and%20Conditions.pdf';
const FALLBACK_MULTI_URL =
  'https://25935419.fs1.hubspotusercontent-eu1.net/hubfs/25935419/Vero%20Assess/Terms%20and%20Conditions/Vero%20Assess%20Multiple%20Role%20Plan%20Terms%20and%20Conditions.pdf';

interface SettingsShape {
  starterContractUrl?: string | null;
  multiRoleContractUrl?: string | null;
}

export default async function ContractPage() {
  const settings = (await client.fetch<SettingsShape | null>(SITE_SETTINGS_QUERY)) ?? {};

  return (
    <ContractClient
      starterContractUrl={settings.starterContractUrl || FALLBACK_STARTER_URL}
      multiRoleContractUrl={settings.multiRoleContractUrl || FALLBACK_MULTI_URL}
    />
  );
}
