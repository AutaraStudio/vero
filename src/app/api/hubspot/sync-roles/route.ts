import { NextResponse } from 'next/server';
import { client as sanityClient } from '@/sanity/lib/client';

/**
 * POST /api/hubspot/sync-roles
 *
 * Pulls every role from Sanity and PATCHes the HubSpot company property
 * `vero_assess_roles` with the full options list. Intended to be triggered
 * by a Sanity webhook on any role document change (create/update/delete).
 *
 * Auth: request must include header `x-vero-sync-secret` matching env
 * `HUBSPOT_SYNC_SECRET`. Without it, returns 401.
 *
 * Response contains the count + the full option list that was written to
 * HubSpot, for debugging visibility.
 */

const HUBSPOT_PROPERTY_URL =
  'https://api.hubapi.com/crm/v3/properties/companies/vero_assess_roles';

const ROLES_SYNC_QUERY = `
  *[_type == "role" && !archived] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    hubspotLabel,
    hubspotValue
  }
`;

interface SanityRole {
  _id: string;
  name: string;
  slug: string;
  hubspotLabel?: string;
  hubspotValue?: string;
}

interface HubSpotOption {
  label: string;
  value: string;
  displayOrder: number;
  hidden: boolean;
}

export async function POST(request: Request) {
  // ── Auth ──
  const secret = request.headers.get('x-vero-sync-secret');
  if (!secret || secret !== process.env.HUBSPOT_SYNC_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: 'Missing HUBSPOT_ACCESS_TOKEN' },
      { status: 500 }
    );
  }

  try {
    // ── Fetch every role from Sanity ──
    const roles = await sanityClient.fetch<SanityRole[]>(ROLES_SYNC_QUERY);

    // ── Build options list, dedup by value ──
    const seen = new Set<string>();
    const options: HubSpotOption[] = [];

    for (const role of roles) {
      const label = (role.hubspotLabel || role.name || '').trim();
      const value = (role.hubspotValue || role.slug || '').trim().toLowerCase();

      if (!label || !value) {
        console.warn(`[Sync] Skipping role ${role._id} — missing label or value`);
        continue;
      }

      if (seen.has(value)) {
        console.warn(`[Sync] Duplicate value "${value}" — skipping ${role._id}`);
        continue;
      }
      seen.add(value);

      options.push({
        label,
        value,
        displayOrder: options.length,
        hidden: false,
      });
    }

    if (options.length === 0) {
      console.warn('[Sync] No valid role options to push');
    }

    // ── PATCH the property ──
    const res = await fetch(HUBSPOT_PROPERTY_URL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ options }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[Sync] HubSpot PATCH failed:', err);
      return NextResponse.json(
        { error: 'HubSpot update failed', detail: err },
        { status: res.status }
      );
    }

    console.log(`[Sync] vero_assess_roles updated with ${options.length} options`);

    return NextResponse.json({
      success: true,
      count: options.length,
      options,
    });
  } catch (err) {
    console.error('[Sync] Error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
