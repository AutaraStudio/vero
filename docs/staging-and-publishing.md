# Staging and Publishing — Setup & Operations Guide

This document explains how Vero Assess separates staging from production and
how content gets published to the live site. There are two audiences:

- **Section 1 — For the client.** Plain-English guide to publishing.
- **Section 2 — For the developer (you).** Setup, deploy, and troubleshooting.

---

## 1. For the Client — How Publishing Works

You have **two versions** of the site:

| Site | URL | Purpose |
|---|---|---|
| **Staging** | https://vero-assess-staging.netlify.app | Your safe sandbox. Edit anything, anytime. Only you see it. |
| **Live**    | https://www.veroassess.com               | The real public website. |

### Your daily workflow

1. **Edit content** in Sanity Studio. Click **Publish** as normal.
   → Your changes appear on the **staging** site within a minute.
2. **Review** at https://vero-assess-staging.netlify.app. Check it looks right.
3. When you're happy, click **Push to Live Site** (the rocket icon, in the
   document action menu next to Publish).
4. **Confirm** the dialog.
   → Your changes appear on **veroassess.com** within a minute.

That's it. The live site **never updates** unless you click "Push to Live Site".
Edit and publish freely — nothing reaches the public site without that final click.

### Common questions

**"What if I make a mistake on the live site?"**
Open the same page in Studio, fix it, publish, then click "Push to Live Site"
again. Or open the document History panel (top right in Studio), pick an
earlier version, restore it, then push to live.

**"Why is the 'Push to Live Site' button greyed out?"**
You probably have unpublished draft edits. Click **Publish** first — once your
changes are live on staging, the button becomes active.

**"Do I need to publish each page separately?"**
Yes. The button promotes the page you're currently editing. If you've changed
five pages, click "Push to Live Site" on each one. This is intentional — it
means a single in-progress edit can't accidentally push four other unfinished
pages live.

---

## 2. For the Developer — Setup & Deployment

### Architecture

```
                     ┌──────────────────────────┐
                     │  Sanity project: abtw5nba│
                     │                          │
                     │  ┌──────────┐ ┌────────┐ │
                     │  │ staging  │ │ prod   │ │
                     │  │ dataset  │ │ dataset│ │
                     │  └────┬─────┘ └────┬───┘ │
                     └───────┼────────────┼─────┘
                             │            │
                       reads │            │ reads
                             ▼            ▼
            ┌────────────────────┐  ┌────────────────────┐
            │ staging.netlify.app│  │   veroassess.com   │
            └────────────────────┘  └────────────────────┘
                     ▲                       ▲
                     │ publish               │ /api/promote writes here
                     │                       │ (server-side, admin token)
                     │                       │
                ┌────┴───────────────────────┴────┐
                │  Sanity Studio  (/studio)       │
                │  • Default dataset: staging     │
                │  • "Push to Live Site" action   │
                └─────────────────────────────────┘
```

### Datasets

Two datasets exist on Sanity project `abtw5nba`:

- **`staging`** — clients edit here. Site at `vero-assess-staging.netlify.app`.
- **`production`** — only written to by `/api/promote`. Site at `veroassess.com`.

Currently both datasets are seeded with the same content (initial copy on
2026-05-06 via `sanity dataset export production` → `sanity dataset import …
staging --replace`).

### Netlify environment variables

You need two Netlify sites — one per dataset.

#### Staging site (`vero-assess-staging.netlify.app`)

```
NEXT_PUBLIC_SANITY_PROJECT_ID  = abtw5nba
NEXT_PUBLIC_SANITY_DATASET     = staging
SANITY_API_TOKEN               = <Editor-role token, write access to BOTH datasets>
SANITY_API_READ_TOKEN          = <Viewer-role token>
SANITY_REVALIDATE_SECRET       = <random string — see below>
SANITY_UPLOAD_TOKEN            = <existing>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY,
HUBSPOT_ACCESS_TOKEN, RESEND_API_KEY = <same as production>
```

#### Production site (`veroassess.com`)

```
NEXT_PUBLIC_SANITY_PROJECT_ID  = abtw5nba
NEXT_PUBLIC_SANITY_DATASET     = production
SANITY_API_TOKEN               = <SAME token as staging — needs write access to both>
SANITY_API_READ_TOKEN          = <Viewer-role token>
SANITY_REVALIDATE_SECRET       = <random string>
SANITY_UPLOAD_TOKEN            = <existing>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY,
HUBSPOT_ACCESS_TOKEN, RESEND_API_KEY = <production values>
```

> **Important:** `SANITY_API_TOKEN` must be a single token with write access to
> **both** datasets. The `/api/promote` route on the production site reads from
> `staging` and writes to `production` using this token. Generate one at
> https://www.sanity.io/manage/project/abtw5nba/api → Tokens → Editor role.

### Sanity webhooks (revalidation)

Add **two** webhooks at https://www.sanity.io/manage/project/abtw5nba/api/webhooks:

| Name                | Dataset    | URL                                            | Filter | Secret |
|---------------------|------------|------------------------------------------------|--------|--------|
| Live revalidation   | production | `https://www.veroassess.com/api/revalidate`    | (blank)| `SANITY_REVALIDATE_SECRET` |
| Staging revalidation| staging    | `https://vero-assess-staging.netlify.app/api/revalidate` | (blank)| `SANITY_REVALIDATE_SECRET` |

Both webhooks: HTTP method POST, API version v2024-09-01+, projection
`{_id, _type, "slug": slug.current}`, trigger on Create + Update + Delete.

### Branch strategy on Netlify

- `main` → builds production site (`veroassess.com`)
- `staging` → builds staging site (`vero-assess-staging.netlify.app`)

Set this in each Netlify site's Build & Deploy → Production branch.

### Files involved

| File | Purpose |
|---|---|
| [src/app/api/promote/route.ts](../src/app/api/promote/route.ts) | Server route that copies a doc + assets from staging → production |
| [src/sanity/actions/promoteAction.tsx](../src/sanity/actions/promoteAction.tsx) | Studio document action ("Push to Live Site" button) |
| [sanity.config.ts](../sanity.config.ts) | Registers the action against every document type |
| [src/app/api/revalidate/route.ts](../src/app/api/revalidate/route.ts) | Existing — fires on Sanity webhooks to bust Next cache |

### How promotion actually works

1. Client clicks "Push to Live Site" in Studio (which is connected to `staging`).
2. Action POSTs `{ documentId }` to `https://www.veroassess.com/api/promote`
   with `Authorization: Bearer <user's Sanity session token>`.
3. Route validates the token via Sanity's `/users/me` endpoint — only real
   Sanity users with project access can promote.
4. Route fetches the published version of the doc from `staging`.
5. Route walks the doc tree for asset references; any image/file asset that
   doesn't exist in `production` is downloaded from the staging CDN and
   re-uploaded into `production`.
6. Route calls `createOrReplace` on the production dataset.
7. Sanity's production webhook fires → `/api/revalidate` invalidates the
   relevant Next.js paths → live site updates within seconds.

### Local development

Local dev uses `staging` by default (set in `.env.local`). Editing in your
local Studio at `localhost:3000/studio` writes to the staging dataset — same
as the deployed staging Studio.

To test the promotion flow locally, the action falls back to a relative
`/api/promote` call when `NODE_ENV === 'development'` so it hits your local
server.

### Troubleshooting

**"Push to Live Site" button is greyed out**
- Active dataset is `production` — the action only works from staging
- Document has unpublished drafts — publish first

**`/api/promote` returns 401**
- Check the calling user is logged into Sanity Studio
- Token didn't reach the route — check browser devtools network tab for the
  Authorization header on the request

**`/api/promote` returns 500 "Asset … referenced but not found in staging"**
- A reference inside the doc points to an asset that no longer exists. Re-add
  the image in Studio, publish, then push.

**Production didn't update after a successful promotion**
- Check the production-dataset Sanity webhook actually fired (Sanity manage →
  API → Webhooks → log)
- Manually invalidate by hitting
  `https://www.veroassess.com/api/revalidate?secret=YOUR_SECRET&type=homePage`

### Future enhancements (not built yet)

- Diff preview in the confirmation dialog (show field-level changes before push)
- Bulk "push everything" action on a Studio dashboard
- One-click rollback button (Sanity's History panel covers this in the meantime)
- Lock client roles to staging only (currently any project member can switch
  datasets via the dataset switcher)
