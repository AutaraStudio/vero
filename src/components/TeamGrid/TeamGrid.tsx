'use client';

import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import type { ThemeVariant } from '@/lib/theme';
import './TeamGrid.css';

export interface TeamMember {
  name: string;
  role?: string;
  category?: string;
  headshotUrl?: string;
  headshotAlt?: string;
}

interface Props {
  eyebrow?: string;
  heading: string;
  intro?: string;
  members: TeamMember[];
  theme?: ThemeVariant;
}

/* Display order + display labels for category buckets. Anything not in this
   list (or with no category) falls into a final "Team" bucket so nobody gets
   lost. Keep this aligned with the schema option list in aboutPage.ts. */
const CATEGORY_ORDER = [
  'leadership',
  'sales',
  'marketing',
  'customerSuccess',
  'peopleOps',
  'science',
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  leadership:      'Leadership',
  sales:           'Sales & Commercial',
  marketing:       'Marketing',
  customerSuccess: 'Customer Success',
  peopleOps:       'People & Operations',
  science:         'Science & Research',
  other:           'Team',
};

function groupMembersByCategory(members: TeamMember[]) {
  const buckets = new Map<string, TeamMember[]>();
  for (const m of members) {
    const key = m.category && CATEGORY_LABELS[m.category] ? m.category : 'other';
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(m);
  }
  /* Order: schema-defined categories first (in CATEGORY_ORDER), then 'other' */
  const ordered: { key: string; label: string; members: TeamMember[] }[] = [];
  for (const key of CATEGORY_ORDER) {
    const list = buckets.get(key);
    if (list && list.length > 0) {
      ordered.push({ key, label: CATEGORY_LABELS[key], members: list });
    }
  }
  const otherList = buckets.get('other');
  if (otherList && otherList.length > 0) {
    ordered.push({ key: 'other', label: CATEGORY_LABELS.other, members: otherList });
  }
  return ordered;
}

export default function TeamGrid({
  eyebrow = 'The team',
  heading,
  intro,
  members,
  theme = 'brand-purple',
}: Props) {
  const labelRef     = useFadeUp({ delay: 0,    duration: 0.5, y: 12 });
  const headingRef   = useTextReveal({ delay: 0.05 });
  const introRef     = useFadeUp({ delay: 0.2,  duration: 0.6, y: 16 });
  const membersRef   = useFadeUp({
    selector: '.team-grid__member',
    stagger: 0.04,
    duration: 0.5,
    y: 20,
  });

  const groups = groupMembersByCategory(members ?? []);

  return (
    <section data-theme={theme} className="team-grid section">
      <div className="container">
        <div className="team-grid__layout">

          {/* ── Left — sticky header column ──────────────── */}
          <aside className="team-grid__intro">
            <div className="team-grid__intro-sticky stack--md">
              {eyebrow && (
                <span ref={labelRef as React.RefObject<HTMLSpanElement>} data-animate="" className="section-label">
                  {eyebrow}
                </span>
              )}
              <h2 ref={headingRef as React.RefObject<HTMLHeadingElement>} data-animate="" className="section-heading">
                {heading}
              </h2>
              {intro && (
                <p ref={introRef as React.RefObject<HTMLParagraphElement>} data-animate="" className="section-intro text-body--lg leading--snug">
                  {intro}
                </p>
              )}
            </div>
          </aside>

          {/* ── Right — categorised member groups ────────── */}
          <div ref={membersRef as React.RefObject<HTMLDivElement>} className="team-grid__groups">
            {groups.length === 0 ? (
              <p className="team-grid__empty text-body--md color--tertiary">
                Team headshots coming soon.
              </p>
            ) : (
              groups.map((group) => (
                <div key={group.key} className="team-grid__group">
                  <h3 className="team-grid__group-heading text-h4 color--primary">
                    {group.label}
                  </h3>
                  <div className="team-grid__group-members">
                    {group.members.map((m, i) => (
                      <article key={`${m.name}-${i}`} className="team-grid__member">
                        <div className="team-grid__headshot">
                          {m.headshotUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={m.headshotUrl}
                              alt={m.headshotAlt ?? m.name}
                              className="team-grid__headshot-img"
                              loading="lazy"
                            />
                          ) : (
                            <div className="team-grid__headshot-placeholder" aria-hidden="true" />
                          )}
                        </div>
                        <div className="team-grid__info">
                          <h4 className="team-grid__name text-h5 color--primary">{m.name}</h4>
                          {m.role && (
                            <p className="team-grid__role text-body--sm color--secondary">{m.role}</p>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
