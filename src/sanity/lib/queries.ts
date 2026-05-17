/* ── Reusable GROQ projections ─────────────────────────────────
   Define these BEFORE any page query that interpolates them — JS
   template literals are evaluated at module-load time and `const`
   references resolve in source order. */

/* Per-page SEO block — historically projected from an inline `seo` field
   on each page. Page singletons now store SEO in separate `pageSeo`
   documents (one per page, deterministic IDs like `homePage.seo`).
   The `jobCategory` collection still uses an inline `seo` field. */
export const SEO_PROJECTION = `
  seo {
    pageTitle,
    metaDescription,
    ogTitle,
    ogDescription,
    "ogImageUrl": ogImage.asset->url,
    "ogImageAlt": ogImage.alt,
    noIndex
  }
`

/**
 * Fetch the companion pageSeo document for a singleton page.
 * Pass the page's _type (e.g. "homePage") and the function builds the
 * predictable SEO doc ID and returns the projected SEO block.
 *
 * Used inside generateMetadata on each page route.
 */
export const PAGE_SEO_QUERY = `
  *[_type == "pageSeo" && _id == $seoId][0] {
    ${SEO_PROJECTION}
  }
`

/**
 * Project a `mediaBlock` field. Returns the toggle type plus image URLs and
 * video URL/thumbnail in flat form ready to feed straight into <MediaBlock />.
 *
 * Usage:
 *   *[_type == "homePage"][0] {
 *     ${mediaProjection('heroMedia')},
 *     ...other fields
 *   }
 */
export function mediaProjection(fieldName: string): string {
  return `
    "${fieldName}": ${fieldName} {
      type,
      "imageUrl": image.asset->url,
      "imageAlt": image.alt,
      "imageMobileUrl": imageMobile.asset->url,
      "imageMobileAlt": imageMobile.alt,
      videoUrl,
      videoPlayback,
      "videoThumbnailUrl": videoThumbnail.asset->url,
      "videoThumbnailAlt": videoThumbnail.alt,
      "videoThumbnailMobileUrl": videoThumbnailMobile.asset->url,
      "videoThumbnailMobileAlt": videoThumbnailMobile.alt
    }
  `;
}

/**
 * Project a `link` object field down to a plain string href so consuming
 * components don't need to know the link is structured under the hood.
 *
 *  - new shape (object with `.type`):
 *      "external"   → returns the external URL
 *      "internal"   → returns the picked static-route path
 *      "reference"  → builds the URL from the referenced doc's slug
 *                     (supports jobCategory, role, legalPage)
 *  - legacy shape (raw string href from before the link migration):
 *      returns the string as-is so unmigrated docs keep rendering
 *
 * Pair with `linkOpenInNewTab(fieldName)` when the consuming component
 * needs the boolean.
 */
export function linkProjection(fieldName: string): string {
  return `
    "${fieldName}": select(
      defined(${fieldName}.type) && ${fieldName}.type == "external" => ${fieldName}.external,
      defined(${fieldName}.type) && ${fieldName}.type == "internal" => ${fieldName}.internal,
      defined(${fieldName}.type) && ${fieldName}.type == "reference" && ${fieldName}.reference->_type == "jobCategory" => "/assessments/" + ${fieldName}.reference->slug.current,
      defined(${fieldName}.type) && ${fieldName}.type == "reference" && ${fieldName}.reference->_type == "legalPage" => "/legal/" + ${fieldName}.reference->slug.current,
      defined(${fieldName}.type) && ${fieldName}.type == "reference" && ${fieldName}.reference->_type == "role" => "/assessments/" + ${fieldName}.reference->parentCategory->slug.current + "/" + ${fieldName}.reference->slug.current,
      ${fieldName}
    )
  `;
}

/** Companion projection for the `openInNewTab` boolean on a link object.
 *  Falls back to false for legacy string hrefs. */
export function linkOpenInNewTab(fieldName: string, alias?: string): string {
  return `"${alias ?? fieldName + 'OpenInNewTab'}": coalesce(${fieldName}.openInNewTab, false)`;
}

/**
 * Project a `contentSection` field. Pulls eyebrow / heading / body /
 * media / cta / layout — the unified shape rendered by the
 * <ContentSection> adapter on the frontend.
 */
export function contentSectionProjection(fieldName: string): string {
  return `
    "${fieldName}": ${fieldName} {
      eyebrow,
      heading,
      body,
      ${mediaProjection('media')},
      ctaLabel,
      ${linkProjection('ctaHref')},
      layout
    }
  `;
}

export const HOME_PAGE_QUERY = `
  *[_type == "homePage"][0] {
        heroBadgeLabel,
    heroTitle,
    heroIntro,
    heroCTALabel,
    ${linkProjection('heroCTAHref')},
    heroSecondaryCTALabel,
    ${linkProjection('heroSecondaryCTAHref')},
    ${mediaProjection('heroMedia')},
    partnerLogosLabel,
    partnerLogos[] {
      name,
      "logoUrl":      logo.asset->url,
      "logoMimeType": logo.asset->mimeType
    },
    ${contentSectionProjection('introSection')},
    uspsSectionLabel,
    uspsSectionHeading,
    uspsSectionSubheading,
    usps[] {
      label,
      body,
      "imageUrl": image.asset->url,
      "imageAlt": image.alt
    },
    uspsCtaLabel,
    ${linkProjection('uspsCtaHref')},
    stepsSectionLabel,
    stepsSectionHeading,
    stepsSectionIntro,
    steps[] {
      title,
      body,
      ctaLabel,
      ${linkProjection('ctaHref')}
    },
    pricingSectionLabel,
    pricingSectionHeading,
    pricingSectionSubheading,
    pricingHighlights,
    pricingCtaLabel,
    ${linkProjection('pricingCtaHref')}
  }
`

export const SITE_SETTINGS_QUERY = `
  *[_type == "siteSettings"][0] {
    siteName,
    titleTemplate,
    defaultMetaDescription,
    "defaultOgImageUrl": defaultOgImage.asset->url,
    "defaultOgImageAlt": defaultOgImage.alt,
    "faviconUrl":         favicon.asset->url,
    "faviconMimeType":    favicon.asset->mimeType,
    "appleTouchIconUrl":  appleTouchIcon.asset->url,
    twitterHandle,
    siteUrl,
    themeColor,
    starterContractUrl,
    multiRoleContractUrl
  }
`

export const PRICING_PAGE_QUERY = `
  *[_type == "pricingPage"][0] {
        heroHeadline,
    heroIntro,
    heroCTALabel,
    ${linkProjection('heroCTAHref')},
    heroSecondaryCTALabel,
    ${linkProjection('heroSecondaryCTAHref')},
    starterCallout,
    bespokeHeading,
    bespokeBody,
    bespokeCtaLabel,
    ${linkProjection('bespokeCtaHref')},
    faqHeading,
    faqs[] {
      question,
      answer
    },
    faqFooter
  }
`

export const ASSESSMENTS_PAGE_QUERY = `
  *[_type == "assessmentsPage"][0] {
        heroHeadline,
    heroIntro,
    heroCTALabel,
    ${linkProjection('heroCTAHref')},
    heroSecondaryCTALabel,
    ${linkProjection('heroSecondaryCTAHref')}
  }
`

export const HOW_IT_WORKS_PAGE_QUERY = `
  *[_type == "howItWorksPage"][0] {
        heroHeadline,
    heroIntro,
    heroCTALabel,
    ${linkProjection('heroCTAHref')},
    heroSecondaryCTALabel,
    ${linkProjection('heroSecondaryCTAHref')},
    ${mediaProjection('heroMedia')},

    ${contentSectionProjection('gettingStartedSection')},

    stepsHeading,
    stepsIntro,
    steps[] {
      headline,
      label,
      body,
      "imageUrl": image.asset->url,
      "imageAlt": image.alt
    },

    ${contentSectionProjection('candidateExperienceSection')},

    benefitsHeading,
    benefits[] {
      label,
      body,
      "imageUrl": image.asset->url,
      "imageAlt": image.alt
    },
    benefitsLinkLabel,
    ${linkProjection('benefitsLinkHref')}
  }
`

export const ABOUT_PAGE_QUERY = `
  *[_type == "aboutPage"][0] {
        heroHeadline,
    heroIntro,
    heroCTALabel,
    ${linkProjection('heroCTAHref')},
    heroSecondaryCTALabel,
    ${linkProjection('heroSecondaryCTAHref')},
    ${mediaProjection('heroMedia')},

    ${contentSectionProjection('tazioEvolutionSection')},
    ${contentSectionProjection('candidateExperiencesSection')},

    clientsHeading,
    clientsIntro,
    "clientLogos": clientLogos[] {
      name,
      "url": logo.asset->url
    },
    rpoIntro,
    "rpoLogos": rpoLogos[] {
      name,
      "url": logo.asset->url
    }
  }
`

export const SCIENCE_PAGE_QUERY = `
  *[_type == "sciencePage"][0] {
        heroHeadline,
    heroBody,
    heroCTALabel,
    ${linkProjection('heroCTAHref')},
    heroSecondaryCTALabel,
    ${linkProjection('heroSecondaryCTAHref')},
    ${mediaProjection('heroMedia')},

    ${contentSectionProjection('authenticSection')},

    theoryHeading,
    theoryIntro,

    perspectivesHeading,
    perspectivesIntro,
    perspectives[] {
      name,
      description,
      "imageUrl": image.asset->url,
      "imageAlt": image.alt
    },

    dimensionsHeading,
    dimensionsBody,
    ${mediaProjection('dimensionsMedia')},
    dimensionCategories[] {
      name,
      dimensions
    },

    ${contentSectionProjection('insightsSection')},

    dataBackedHeading,
    dataBackedIntro,
    dataBackedPoints[] {
      heading,
      body
    },

    ctaBody,
    ctaLabel,
    ${linkProjection('ctaHref')}
  }
`

export const COMPLIANCE_PAGE_QUERY = `
  *[_type == "compliancePage"][0] {
        heroHeadline,
    heroBody,
    heroCTALabel,
    ${linkProjection('heroCTAHref')},
    heroSecondaryCTALabel,
    ${linkProjection('heroSecondaryCTAHref')},

    securityHeading,
    securityBody,
    ${mediaProjection('securityBadgesMedia')},
    securityCredentials[] {
      label,
      description
    },

    qualityHeading,
    qualityBody,
    qualityItems[] {
      label,
      description,
      "imageUrl": image.asset->url,
      "imageAlt": image.alt
    },

    ${contentSectionProjection('aiSection')},

    accessibilityHeading,
    accessibilityBody,
    accessibilityItems[] {
      label,
      description,
      "imageUrl": image.asset->url,
      "imageAlt": image.alt
    }
  }
`

export const CONTACT_PAGE_QUERY = `
  *[_type == "contactPage"][0] {
        heroHeadline,
    heroIntro,
    contactInstructions,
    phone,
    email,

    faqHeading,
    faqs[] {
      question,
      answer
    },
    faqFooter
  }
`

export const PRICING_TIERS_QUERY = `
  *[_type == "pricingTier"] | order(order asc) {
    _id,
    name,
    "slug": slug.current,
    order,
    isFeatured,
    tierLabel,
    tagline,
    priceDisplay,
    annualPrice,
    monthlyPriceDisplay,
    monthlyPriceNote,
    monthlyPrice,
    paymentOptions,
    duration,
    candidateLimit,
    roleLimit,
    ctaLabel,
    ctaType,
    upgradeNote,
    bespokeDescription,
    features[] {
      label,
      value,
      footnote
    }
  }
`

export const PRICING_TIER_BY_SLUG_QUERY = `
  *[_type == "pricingTier" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    isFeatured,
    tierLabel,
    tagline,
    priceDisplay,
    annualPrice,
    paymentOptions,
    duration,
    candidateLimit,
    roleLimit,
    ctaLabel,
    ctaType,
    upgradeNote,
    bespokeDescription
  }
`

export const JOB_CATEGORIES_QUERY = `
  *[_type == "jobCategory"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    keyDimensionsAssessed,
    heroHeadline,
    "heroImage": heroImage.asset->url
  }
`

export const JOB_CATEGORY_BY_SLUG_QUERY = `
  *[_type == "jobCategory" && slug.current == $slug][0] {
    ${SEO_PROJECTION},
    _id,
    name,
    "slug": slug.current,
    keyDimensionsAssessed,
    heroHeadline,
    heroIntroCopy,
    heroCTALabel,
    ${linkProjection('heroCTAHref')},
    heroSecondaryCTALabel,
    ${linkProjection('heroSecondaryCTAHref')},
    ${mediaProjection('heroMedia')},
    ${contentSectionProjection('dimensionsSectionContent')},
    inActionLabel,
    inActionHeading,
    inActionIntro,
    featureCards[] {
      heading,
      body,
      "imageUrl": image.asset->url,
      "imageAlt": image.alt
    },
    stat1Heading,
    stat1Body,
    stat2Heading,
    stat2Body,
    stat3Heading,
    stat3Body,
    stat4Heading,
    stat4Body,
    roleRosterHeading,
    roleRosterSubheading,
    bespokeSectionHeading,
    bespokeSectionBody,
    bespokeCTALabel,
    ${linkProjection('bespokeCTAHref')},
    ${mediaProjection('bespokeSectionMedia')},
    "roles": *[_type == "role" && parentCategory._ref == ^._id && archived != true] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      hubspotValue,
      tasks,
      strengths,
      "lottieUrl": lottieFile.asset->url
    }
  }
`

export const JOB_CATEGORY_SLUGS_QUERY = `
  *[_type == "jobCategory"] { "slug": slug.current }
`

export const NAV_CATEGORIES_QUERY = `
  *[_type == "jobCategory"] | order(name asc) {
    name,
    "slug": slug.current,
    navDescription
  }
`

/* ─────────────────────────────────────────────────────────────
   Global singletons — fetched once and shared by layout-level
   components (nav + footer).
───────────────────────────────────────────────────────────── */

export const GLOBAL_NAV_QUERY = `
  *[_id == "globalNav"][0] {
    topItems[] {
      _key,
      _type,
      label,
      ${linkProjection('href')},
      "external": coalesce(href.openInNewTab, external, false)
    },
    companyColumns[] {
      _key,
      title,
      links[] {
        _key,
        label,
        description,
        ${linkProjection('href')},
        "external": coalesce(href.openInNewTab, external, false)
      }
    },
    companyCard {
      eyebrow,
      body,
      ctaLabel,
      ${linkProjection('ctaHref')},
      "imageUrl": image.asset->url,
      "imageAlt": image.alt
    },
    ctaLabel,
    ${linkProjection('ctaHref')},
    secondaryCtaLabel,
    ${linkProjection('secondaryCtaHref')}
  }
`

export const GLOBAL_FOOTER_QUERY = `
  *[_id == "globalFooter"][0] {
    ctaHeading,
    ctaEyebrow,
    ctaBenefits,
    ctaPrimaryLabel,
    ${linkProjection('ctaPrimaryHref')},
    ctaSecondaryLabel,
    ${linkProjection('ctaSecondaryHref')},
    linkColumns[] {
      _key,
      title,
      links[] {
        _key,
        label,
        ${linkProjection('href')},
        "external": coalesce(href.openInNewTab, external, false)
      }
    },
    contactPhone,
    contactEmail,
    contactAddress,
    socialLinks[] {
      _key,
      platform,
      url
    },
    legalLinks[] {
      _key,
      label,
      ${linkProjection('href')},
      "external": coalesce(href.openInNewTab, external, false)
    },
    businessText,
    copyrightText,
    partnerLabel,
    "partnerLogoUrl": partnerLogo.asset->url,
    "partnerLogoAlt": partnerLogo.alt
  }
`

export const GLOBAL_CATEGORY_GROUPS_QUERY = `
  *[_id == "globalCategoryGroups"][0] {
    groups[] {
      _key,
      title,
      categories[]-> {
        _id,
        name,
        "slug": slug.current,
        navDescription
      }
    }
  }
`

export const ALL_ROLES_QUERY = `
  *[_type == "role" && archived != true] | order(parentCategory->name asc, name asc) {
    _id,
    name,
    "slug": slug.current,
    "categoryName": parentCategory->name,
    "categorySlug": parentCategory->slug.current,
    strengths
  }
`

export const LEGAL_PAGE_BY_SLUG_QUERY = `
  *[_type == "legalPage" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    intro,
    lastUpdated,
    body,
    legacyMarkdown
  }
`

export const LEGAL_PAGE_SLUGS_QUERY = `
  *[_type == "legalPage" && defined(slug.current)] { "slug": slug.current }
`

export const ALL_ROLE_IDS_QUERY = `*[_type == "role" && archived != true]._id`

/* Singleton — Studio's documentId('comingSoon') forces a single doc, but
   a doc created via the MCP / API may end up at a different _id, so the
   query is _type-only to be defensive. There should never be more than
   one. */
export const COMING_SOON_QUERY = `
  *[_type == "comingSoon"][0] {
    enabled,
    heading,
    description,
    launchDate,
    formInstructions
  }
`

export const COMING_SOON_CONTACT_QUERY = `
  *[_type == "contactPage"][0] { phone, email }
`

export const ROLES_BY_CATEGORY_QUERY = `
  *[_type == "jobCategory"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    "roles": *[_type == "role" && parentCategory._ref == ^._id && archived != true] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      hubspotValue,
      strengths
    }
  }
`
