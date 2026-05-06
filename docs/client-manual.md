# Vero Assess — Content Editor's Manual

A friendly guide to editing the website. No coding required.

> **TL;DR**
> 1. Log in to Sanity Studio
> 2. Edit content in the sidebar
> 3. Click **Publish** when you're happy
> 4. Wait ~5 seconds — your changes appear on the live site automatically

---

## Table of contents

1. [Logging in](#1-logging-in)
2. [Studio at a glance](#2-studio-at-a-glance)
3. [Editing a page](#3-editing-a-page)
4. [SEO (search engine + social sharing)](#4-seo-search-engine--social-sharing)
5. [Adding an image — and the new image-or-video toggle](#5-adding-an-image--and-the-new-image-or-video-toggle)
6. [Working with job categories and roles](#6-working-with-job-categories-and-roles)
7. [Site-wide settings](#7-site-wide-settings)
8. [Publishing and how long it takes to appear](#8-publishing-and-how-long-it-takes-to-appear)
9. [Common tasks — quick recipes](#9-common-tasks--quick-recipes)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Logging in

Sanity Studio lives at:

```
https://veroassess.com/studio
```

(Or whichever URL your developer gives you.)

Use the email address you were invited with. First time logging in, you'll get a magic-link email — click it to confirm.

> 🎬 **Screen recording placeholder — "Logging in"**
> *(record: visit the studio URL → enter email → click magic link → land in the dashboard)*

---

## 2. Studio at a glance

When you log in, you'll see three main areas in the **left sidebar**:

```
📄 Pages              ← all your marketing pages
👥 Job categories     ← e.g. Sales, Administration, Graduates
👤 Roles              ← individual job roles within each category
📦 Pricing tiers      ← Starter, Growth, Scale, Enterprise
─────────
⚙️ Site settings      ← global stuff (favicon, footer CTA, etc.)
```

Click any of these to expand. The main panel on the right shows whatever you've selected.

> 🎬 **Screen recording placeholder — "Studio sidebar tour"**
> *(record: ~20 seconds clicking through each top-level item showing what's inside)*

---

## 3. Editing a page

Click **Pages** in the sidebar. You'll see all 8 marketing pages:

- Home page
- Pricing page
- Assessments overview
- How it works
- About us
- Contact
- The science
- Compliance

Click any page (e.g. **Home page**). Each one expands into two sub-items:

- **📝 Content** — the actual page sections (Hero, Intro, USPs, etc.)
- **🔍 SEO** — search engine title + social sharing settings

Click **Content** first.

You'll see the page form, with **section tabs at the top** of the document:

```
Section 1 — Hero  |  Section 2 — Intro + video  |  Section 3 — Feature highlights  ...
```

**Click a section tab to edit just that section.** Each section has helpful field labels and descriptions explaining where each piece of content appears on the live site.

To edit:
- Click into any text field and type
- Click into image fields to upload an image
- Drag-and-drop array items (like cards or FAQ entries) to reorder them
- Click the trash icon to remove an item

When you're happy, click the **Publish** button at the bottom-right.

> 🎬 **Screen recording placeholder — "Editing a section"**
> *(record: ~25 seconds: click Pages → Home page → Content → click Section 2 tab → change a field → click Publish → show "Last published" timestamp update)*

---

## 4. SEO (search engine + social sharing)

For each page, click the **🔍 SEO** sub-item in the sidebar.

You'll get a clean form with just SEO fields — no section tabs cluttering the view. The fields are:

- **Page title** — what shows in the browser tab and Google search results. Aim for ≤60 characters. Leave blank to use the page heading.
- **Meta description** — the snippet shown under the title in search results. Aim for ≤160 characters.
- **Social share title** — what shows when someone shares the page on Facebook / LinkedIn / Slack / etc. Optional — defaults to the Page title.
- **Social share description** — same idea, for the social share preview text.
- **Social share image** — the image shown in social link previews. Recommended: 1200×630px JPG/PNG. If left blank, falls back to the global default in Site Settings.
- **Hide from search engines** — check this to add a "noindex" tag (use sparingly — only for pages you don't want in Google).

**Anything left blank automatically inherits from Site Settings**, so you only need to fill in things you want to override.

> 🎬 **Screen recording placeholder — "Editing SEO for a page"**
> *(record: ~20 seconds: click Pages → About us → SEO → fill in page title and meta description → publish)*

---

## 5. Adding an image — and the new image-or-video toggle

Most "media" slots on the site (hero images, intro block visuals, dashboard screenshots, etc.) support **either an image OR a video**.

When you click into a media field, you'll see a radio toggle at the top:

- **Image** — upload a static image
- **Video (opens modal on click)** — upload a video that plays in three different ways (you choose)

### If you pick Image

1. Click the upload area → choose an image from your computer
2. Once uploaded, click the image to set the **hotspot** — this is the focal point that stays visible when the image is cropped at different sizes
3. Add **alt text** — a short description for screen readers and SEO

That's it. Save & publish.

### If you pick Video

You'll get an extra question: **"How should the video play?"** with three choices:

| Choice | What it does |
|---|---|
| **Popup with image preview** | Static cover image with a play button. Visitor clicks → modal opens with sound. |
| **Popup with looping video preview** | A muted looping video preview plays in the slot. Click it → modal opens with sound. |
| **Autoplay only (muted, looping)** | Video plays silently in place, no popup, no click. Like a background video. |

Then upload:
- **Video cover image** — the still image shown before the video plays. Recommended 16:9 ratio (e.g. 1280×720). Used as the poster for autoplay videos.
- **Video file URL** — paste a direct link to an `.mp4` file. (Where to host: Bunny CDN, Mux, Vimeo direct file URL, S3, etc. — anything that serves an `.mp4`.)

> 🎬 **Screen recording placeholder — "Adding an image, then changing it to a video"**
> *(record: ~30 seconds: open a media field → upload image → set hotspot → switch toggle to Video → choose playback mode → upload cover + paste URL → publish)*

---

## 6. Working with job categories and roles

These power the `/assessments` page and each `/assessments/[category]` detail page.

### Job categories

Sidebar → **Job categories** shows all 10 categories. Click any to edit.

Each category has 7 sections (matching the page structure):

1. **Hero** — top of the category page
2. **Dimensions explainer** — what we measure for this category
3. **"In action" header** — section header above the carousel
4. **Feature carousel cards** — the lead card + extra cards in the carousel
5. **Headline stats** — 4 stat tiles ("82% of hires retained at 12 months", etc.)
6. **Role roster** — heading above the auto-generated grid of roles
7. **Bespoke CTA** — closing band offering custom assessments

Each category also has its own **SEO** group at the top.

### Roles

Sidebar → **Roles** shows everything organised by category:

- **All roles** — every role on the site
- Then one folder per category (Administration / Sales / etc.) showing just that category's roles

Each role has:
- **Name** (e.g. "Account Executive")
- **URL slug** (auto-generated from the name — leave alone)
- **Job category** — pick the parent category from the dropdown
- **Tasks** — one-line summary of what the role does
- **Strengths** — comma-separated list
- **Lottie animation** — optional `.json` file for the role card animation
- **HubSpot Label / Internal Value** — only edit if integrating with HubSpot (your dev team will handle this)

### Adding a new role

1. Sidebar → **Roles** → **All roles**
2. Top-right → click **Create** (the + icon)
3. Fill in name, pick parent category, fill in tasks/strengths
4. Publish

The role automatically appears on the parent category's `/assessments/[category]` page within ~5 seconds.

> 🎬 **Screen recording placeholder — "Adding a new role"**
> *(record: ~25 seconds: Roles → All roles → Create → fill in name + category + tasks + strengths → Publish → load the live category page → see new role appear)*

---

## 7. Site-wide settings

Sidebar → **Site settings** (bottom of the list). One document, four groups:

### SEO & Branding
Global defaults that any page falls back to when its own SEO fields are blank.
- **Site name** — appended to every page title (e.g. "Pricing — Vero Assess")
- **Title template** — the pattern (default `%s — %site`). Probably leave alone.
- **Default meta description**
- **Default social share image** — used in any link preview when a page hasn't set its own
- **Favicon** — browser-tab icon. Square PNG/SVG, 32×32 or larger
- **Apple touch icon** — when someone adds the site to their iOS home screen. 180×180 PNG
- **Twitter handle** — without the @
- **Canonical site URL** — e.g. `https://www.veroassess.com`. Used to build absolute share URLs
- **Browser theme colour** — hex value used by mobile browsers (e.g. `#472d6a`)

### Footer
- **Footer CTA heading / body / button label / button href** — controls the closing CTA at the bottom of every page

### Nav
- **Nav CTA label / href** — controls the "Get started" button in the top-right of every page

### Partner Logos
- **Default section label** — eyebrow above logo strips (e.g. "Trusted by hiring teams at")
- **Partner logos** — list of partner companies. SVG strongly preferred. These render in the marquee strips wherever you've placed one (currently the home-page hero strip)

> 🎬 **Screen recording placeholder — "Updating site-wide branding"**
> *(record: ~25 seconds: Site settings → SEO & Branding → swap favicon → upload new default share image → update site name → publish)*

---

## 8. Publishing and how long it takes to appear

When you click **Publish** at the bottom-right of any document:

1. Sanity saves your changes
2. Sanity fires a webhook to the live site
3. The live site rebuilds the affected page
4. **Within ~5–10 seconds**, your changes are visible on the public URL

If you don't see your changes immediately:
- Wait another 5–10 seconds
- **Hard refresh** the page (Ctrl+F5 on Windows, Cmd+Shift+R on Mac) to clear your browser cache

> ⚠️ **You must click Publish for changes to go live.**
> Saving an unpublished draft (the green dot at the top labelled "Draft") only saves your work in Sanity — it doesn't update the public site.

---

## 9. Common tasks — quick recipes

### Update the home page hero copy
1. Sidebar → **Pages → Home page → 📝 Content**
2. Click the **Section 1 — Hero** tab at the top of the document
3. Edit Headline / Intro paragraph
4. **Publish**

### Swap the home page hero image for a video
1. Sidebar → **Pages → Home page → 📝 Content**
2. Section 1 — Hero tab → scroll to **Hero media (image or video)**
3. Click the radio toggle → pick **"Video (opens modal on click)"**
4. Pick how the video should play
5. Upload cover image + paste video URL
6. **Publish**

### Add a new FAQ to the pricing page
1. Sidebar → **Pages → Pricing page → 📝 Content**
2. Click the **Section 4 — FAQ** tab
3. Scroll to **Questions & answers**
4. Click **Add item** at the bottom of the list
5. Type your question, then click into the answer area to write the answer
6. Drag the new entry to wherever in the list you want it
7. **Publish**

### Add a new team member to the About page
1. Sidebar → **Pages → About us → 📝 Content**
2. **Section 5 — Team grid** tab
3. Scroll to **Team members** → **Add item**
4. Fill in Name, Role, Department dropdown, Headshot
5. **Publish**

### Update a logo in the partner marquee
1. Sidebar → **Site settings** → **Partner Logos** group
2. Find the logo in the list, click into it, replace the file
3. **Publish**

### Change a category page's hero headline
1. Sidebar → **Job categories**
2. Click the category (e.g. **Sales**)
3. **Section 1 — Hero** tab → edit Headline
4. **Publish**

> 🎬 **Screen recording placeholder — "Quick recipes walkthrough"**
> *(record: ~30 seconds: do 2-3 of the above in sequence to show the speed of editing)*

---

## 10. Troubleshooting

### "I published but the live site still shows the old content"
- Wait 10 seconds and hard-refresh (Ctrl+F5 / Cmd+Shift+R)
- If still not updated after a minute, contact your developer — the revalidation webhook may have failed

### "I see 'Unknown field' warnings on a document"
- Means the schema has been updated but the document still has old field data. Generally safe to ignore until the next time you edit that field
- If it's persistent or annoying, ask your developer to clean up

### "My image is too dark / cropped weirdly on mobile"
- Set the **hotspot** by clicking the uploaded image → click on the focal point. The image will always stay focused there when cropped to different aspect ratios
- For very dark images, try a brighter version

### "I uploaded a video but it's not playing"
- Check the **Video file URL** is a direct link to an `.mp4` file (not a YouTube page link or similar)
- Test the URL in a new browser tab — does it play directly? If yes, it should work in the site
- If it's HLS (`.m3u8`), make sure your hosting CDN allows cross-origin playback

### "I want to undo a publish"
- Sanity keeps version history. Click the **History** icon (clock-with-arrow) in the top-right of any document
- Pick the version you want to roll back to → click **Use this version**
- Then **Publish** to push it live

### "I created a draft but didn't publish — where did it go?"
- Drafts are auto-saved as you type. To find them again, just navigate back to the same document — the draft is loaded automatically
- The "Published" / "Draft" pills at the top of the document show what state you're in

### "I want to delete a category / role / page"
- Open the document → top-right ⋯ menu → **Delete**
- ⚠️ Deletes are permanent. If a category has roles linked to it, the roles will be orphaned — delete or reassign those first.

---

## Need more help?

Contact your developer. Include:
- A screenshot of what you're seeing
- The Sanity Studio URL of the document you were editing
- The live site URL where the issue appears
- What you expected vs what actually happened

That's everything they need to debug fast.

---

*Last updated: when this manual was created. If something looks different in Studio, ping your developer for an updated version.*
