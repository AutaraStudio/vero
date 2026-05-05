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
      videoUrl,
      videoPlayback,
      "videoThumbnailUrl": videoThumbnail.asset->url,
      "videoThumbnailAlt": videoThumbnail.alt
    }
  `;
}

export const HOME_PAGE_QUERY = `
  *[_type == "homePage"][0] {
        heroBadgeLabel,
    heroBadgeHref,
    heroTitle,
    heroIntro,
    heroCTALabel,
    heroCTAHref,
    heroSecondaryCTALabel,
    heroSecondaryCTAHref,
    ${mediaProjection('heroMedia')},
    introBlockEyebrow,
    introBlockHeading,
    introBlockBody,
    introBlockCtaLabel,
    introBlockCtaHref,
    ${mediaProjection('introBlockMedia')},
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
    uspsCtaHref,
    stepsSectionLabel,
    stepsSectionHeading,
    stepsSectionIntro,
    steps[] {
      title,
      body,
      ctaLabel,
      ctaHref
    },
    pricingSectionLabel,
    pricingSectionHeading,
    pricingSectionSubheading,
    pricingHighlights,
    pricingCtaLabel,
    pricingCtaHref,
    closingStatement,
    closingEyebrow,
    closingBenefits,
    closingCtaLabel,
    closingCtaHref
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
    footerCtaHeading,
    footerCtaBody,
    footerCtaButtonLabel,
    footerCtaButtonHref,
    navCtaLabel,
    navCtaHref,
    partnerLogosLabel,
    partnerLogos[] {
      name,
      "logoUrl":      logo.asset->url,
      "logoMimeType": logo.asset->mimeType
    }
  }
`

export const PRICING_PAGE_QUERY = `
  *[_type == "pricingPage"][0] {
        heroHeadline,
    heroIntro,
    starterCallout,
    bespokeHeading,
    bespokeBody,
    bespokeCtaLabel,
    bespokeCtaHref,
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
    heroCTAHref
  }
`

export const HOW_IT_WORKS_PAGE_QUERY = `
  *[_type == "howItWorksPage"][0] {
        heroHeadline,
    heroIntro,
    heroCTALabel,
    heroCTAHref,
    heroSecondaryCTALabel,
    heroSecondaryCTAHref,
    ${mediaProjection('heroMedia')},

    gettingStartedHeading,
    gettingStartedBody,
    ${mediaProjection('gettingStartedMedia')},
    gettingStartedLinkLabel,
    gettingStartedLinkHref,

    stepsHeading,
    stepsIntro,
    steps[] {
      body,
      "imageUrl": image.asset->url,
      "imageAlt": image.alt
    },

    candidateExpHeading,
    candidateExpBody,
    ${mediaProjection('candidateExpMedia')},

    benefitsHeading,
    benefits[] {
      label,
      body,
      "imageUrl": image.asset->url,
      "imageAlt": image.alt
    },
    benefitsLinkLabel,
    benefitsLinkHref
  }
`

export const ABOUT_PAGE_QUERY = `
  *[_type == "aboutPage"][0] {
        heroHeadline,
    heroIntro,
    ${mediaProjection('heroMedia')},

    tazioEvolutionHeading,
    tazioEvolutionBody,
    ${mediaProjection('tazioEvolutionMedia')},
    tazioEvolutionCTALabel,
    tazioEvolutionCTAHref,

    candidateExperiencesHeading,
    candidateExperiencesBody,
    ${mediaProjection('candidateExperiencesMedia')},

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
    },

    teamHeading,
    teamIntro,
    teamMembers[] {
      name,
      role,
      category,
      "headshotUrl": headshot.asset->url,
      "headshotAlt": headshot.alt
    }
  }
`

export const SCIENCE_PAGE_QUERY = `
  *[_type == "sciencePage"][0] {
        heroHeadline,
    heroBody,

    authenticHeading,
    authenticBody,

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

    insightsHeading,
    insightsBody,
    ${mediaProjection('insightsMedia')},

    dataBackedHeading,
    dataBackedIntro,
    dataBackedPoints[] {
      heading,
      body
    },

    ctaBody,
    ctaLabel,
    ctaHref
  }
`

export const COMPLIANCE_PAGE_QUERY = `
  *[_type == "compliancePage"][0] {
        heroHeadline,
    heroBody,

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

    aiHeading,
    aiBody,
    ${mediaProjection('aiMedia')},

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
    ${mediaProjection('heroMedia')},
    dimensionsSectionHeading,
    dimensionsSectionBody,
    ${mediaProjection('dimensionsSectionMedia')},
    inActionLabel,
    inActionHeading,
    inActionIntro,
    featureCardsHeading,
    featureCardsSubheading,
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
    bespokeCTAHref,
    ${mediaProjection('bespokeSectionMedia')},
    "roles": *[_type == "role" && parentCategory._ref == ^._id] | order(name asc) {
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
    "slug": slug.current
  }
`

export const ALL_ROLES_QUERY = `
  *[_type == "role"] | order(parentCategory->name asc, name asc) {
    _id,
    name,
    "slug": slug.current,
    "categoryName": parentCategory->name,
    "categorySlug": parentCategory->slug.current,
    strengths
  }
`

export const ROLES_BY_CATEGORY_QUERY = `
  *[_type == "jobCategory"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    "roles": *[_type == "role" && parentCategory._ref == ^._id] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      hubspotValue,
      strengths
    }
  }
`
