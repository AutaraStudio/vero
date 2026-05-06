# Hand-over — Staging / Production Workflow

Read this at the start of a new Claude session to pick up where we left off.

---

## What was built

A two-environment workflow so a non-technical client can edit content
safely. Code changes go through normal PRs; content goes through a
client-driven "Push to Live" button.

### Sanity datasets

| Dataset      | Read by                                              | Written by           |
|--------------|------------------------------------------------------|----------------------|
| `staging`    | `staging` branch / `staging--vero-assess-staging.netlify.app` | client edits in Studio |
| `production` | `main` branch / `veroassess.com`                     | `/api/promote` only — never directly |

Project ID: `abtw5nba`. Both datasets seeded from the same export on 2026-05-06.

### Branches + Netlify

| Branch    | Builds                                          | Dataset env var |
|-----------|-------------------------------------------------|-----------------|
| `main`    | `veroassess.com` (production deploy context)    | `production`    |
| `staging` | `staging--vero-assess-staging.netlify.app`      | `staging`       |

Single Netlify site, branch deploys, per-context env vars on
`NEXT_PUBLIC_SANITY_DATASET`.

### Sanity webhooks

Two revalidation webhooks at https://www.sanity.io/manage/project/abtw5nba/api/webhooks:
- `production` dataset → `https://www.veroassess.com/api/revalidate`
- `staging` dataset → `https://staging--vero-assess-staging.netlify.app/api/revalidate`

Both share the `SANITY_REVALIDATE_SECRET` env var.

### /admin namespace

All internal/client-facing tools live under `/admin`. Outside the public
`(site)` route group. Excluded from indexing via robots.txt + page metadata.

| Route             | What it is                                    |
|-------------------|-----------------------------------------------|
| `/admin`          | Landing page with Studio + Guide tiles + status badge |
| `/admin/studio`   | Sanity Studio (basePath set in `sanity.config.ts`) |
| `/admin/guide`    | Markdown content-editor manual                |

Production builds redirect `/admin/*` → staging admin via `next.config.ts`.

### Custom Studio features

| Feature                            | Where                                         |
|------------------------------------|-----------------------------------------------|
| "Push to Live Site" doc action     | `src/sanity/actions/promoteAction.tsx`        |
| "Backups" tool (snapshot + restore)| `src/sanity/tools/backupsTool.tsx`            |
| `siteBackup` schema                | `src/sanity/schemaTypes/siteBackup.ts`        |

### API routes

| Route             | What it does                                              |
|-------------------|-----------------------------------------------------------|
| `/api/promote`    | Copies one doc + assets from staging → production         |
| `/api/backup`     | Snapshots all production docs into a `siteBackup` in staging |
| `/api/restore`    | Replays a `siteBackup` back into production atomically    |
| `/api/revalidate` | Pre-existing — busts Next cache on Sanity webhooks        |

All three custom routes use the same origin allow-list (no per-user token —
Sanity Studio v3 uses cookie auth and `client.config().token` is empty).

### Netlify env vars (both contexts)

```
NEXT_PUBLIC_SANITY_PROJECT_ID  = abtw5nba
NEXT_PUBLIC_SANITY_DATASET     = staging | production   (per context)
SANITY_API_TOKEN               = project-wide Editor token (writes to BOTH)
SANITY_API_READ_TOKEN          = Viewer token
SANITY_REVALIDATE_SECRET       = (shared with both webhooks)
SANITY_UPLOAD_TOKEN            = (existing)
BACKUP_CRON_SECRET             = shared with the GitHub Actions nightly-backup workflow
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY,
HUBSPOT_ACCESS_TOKEN, RESEND_API_KEY = same values
```

---

## Operating model

### For the client (non-technical)

1. Edit + Publish in Studio at `/admin/studio` → appears on staging URL.
2. Review on `staging--vero-assess-staging.netlify.app`.
3. Click rocket icon → **Push to Live Site** → confirm. Production updates in ~30s.

For dataset-wide rollback:
- Studio top bar → **Backups** → **Take snapshot** before risky edits.
- If something breaks → **Backups** → **Restore to Live** (type the snapshot
  name to confirm).
- A nightly automatic backup also runs at 02:15 UTC via GitHub Actions
  (`.github/workflows/nightly-backup.yml`), so there is always a recent
  snapshot even if the client forgets to take one.

For per-doc rollback: Sanity's built-in History panel (clock icon, top right
of any doc).

### For the developer

- Code changes: PR against `main` (deploys to prod), or push to `staging`
  branch first to verify on the staging URL.
- After merging code to `main`, sync `staging` with: `git checkout staging
  && git merge main && git push && git checkout main`.

---

## Outstanding / nice-to-haves (not built)

- Diff preview inside the Push to Live confirm dialog (show what fields
  are about to change).
- Custom Studio theme with proper brand colours — tried, reverted, not
  worth the effort.
- Lock client roles to staging only at the Sanity ACL level (currently
  anyone with project access could switch datasets via the dataset
  switcher in Studio, which we hid from non-admin users implicitly via
  the production redirect but didn't enforce on Sanity's side).

---

## Useful files & paths

```
sanity.config.ts                              Studio + plugins config
next.config.ts                                /admin redirect on production
src/app/admin/page.tsx                        landing page
src/app/admin/admin-landing.module.css        landing styles
src/app/admin/studio/[[...tool]]/page.tsx     Studio mount
src/app/admin/guide/page.tsx                  guide page
src/app/api/promote/route.ts
src/app/api/backup/route.ts
src/app/api/restore/route.ts
src/sanity/actions/promoteAction.tsx
src/sanity/tools/backupsTool.tsx
src/sanity/schemaTypes/siteBackup.ts
src/app/robots.ts                             disallows /admin/
docs/staging-and-publishing.md                client + dev guide
docs/client-manual.md                         deeper editorial manual
```

---

## URLs to bookmark

- Live site: https://www.veroassess.com
- Staging site: https://staging--vero-assess-staging.netlify.app
- Staging admin (this is the URL the client uses): https://staging--vero-assess-staging.netlify.app/admin
- Sanity manage: https://www.sanity.io/manage/project/abtw5nba
- GitHub: https://github.com/AutaraStudio/vero
