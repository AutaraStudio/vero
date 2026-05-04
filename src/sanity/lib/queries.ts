/* ── Reusable GROQ projections ─────────────────────────────────
   Define these BEFORE any page query that interpolates them — JS
   template literals are evaluated at module-load time and `const`
   references resolve in source order. */

/* Per-page SEO block. Drop `${SEO_PROJECTION}` into any page query. */
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

export const HOME_PAGE_QUERY = `
  *[_type == "homePage"][0] {
    ${SEO_PROJECTION},
    heroBadgeLabel,
    heroBadgeHref,
    heroTitle,
    heroIntro,
    heroCTALabel,
    heroCTAHref,
    heroSecondaryCTALabel,
    heroSecondaryCTAHref,
    heroMediaType,
    "heroImageUrl":          heroImage.asset->url,
    "heroImageAlt":          heroImage.alt,
    "heroVideoThumbnailUrl": heroVideoThumbnail.asset->url,
    "heroVideoThumbnailAlt": heroVideoThumbnail.alt,
    heroVideoUrl,
    introBlockEyebrow,
    introBlockHeading,
    introBlockBody,
    introBlockCtaLabel,
    introBlockCtaHref,
    "introBlockVideoThumbnailUrl": introBlockVideoThumbnail.asset->url,
    "introBlockVideoThumbnailAlt": introBlockVideoThumbnail.alt,
    introBlockVideoUrl,
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
    ${SEO_PROJECTION},
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
    ${SEO_PROJECTION},
    heroHeadline,
    heroIntro,
    heroCTALabel,
    heroCTAHref
  }
`

export const HOW_IT_WORKS_PAGE_QUERY = `
  *[_type == "howItWorksPage"][0] {
    ${SEO_PROJECTION},
    heroHeadline,
    heroIntro,
    heroCTALabel,
    heroCTAHref,
    heroSecondaryCTALabel,
    heroSecondaryCTAHref,
    "heroImageUrl": heroImage.asset->url,
    "heroImageAlt": heroImage.alt,

    gettingStartedHeading,
    gettingStartedBody,
    "gettingStartedImageUrl": gettingStartedImage.asset->url,
    "gettingStartedImageAlt": gettingStartedImage.alt,
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
    "candidateExpImageUrl": candidateExpImage.asset->url,
    "candidateExpImageAlt": candidateExpImage.alt,

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
    ${SEO_PROJECTION},
    heroHeadline,
    heroIntro,
    "heroImageUrl": heroImage.asset->url,
    "heroImageAlt": heroImage.alt,

    tazioEvolutionHeading,
    tazioEvolutionBody,
    "tazioEvolutionImageUrl": tazioEvolutionImage.asset->url,
    "tazioEvolutionImageAlt": tazioEvolutionImage.alt,
    tazioEvolutionCTALabel,
    tazioEvolutionCTAHref,

    candidateExperiencesHeading,
    candidateExperiencesBody,
    "candidateExperiencesImageUrl": candidateExperiencesImage.asset->url,
    "candidateExperiencesImageAlt": candidateExperiencesImage.alt,

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
    ${SEO_PROJECTION},
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
    "dimensionsImageUrl": dimensionsImage.asset->url,
    "dimensionsImageAlt": dimensionsImage.alt,
    dimensionCategories[] {
      name,
      dimensions
    },

    insightsHeading,
    insightsBody,
    "insightsImageUrl": insightsImage.asset->url,
    "insightsImageAlt": insightsImage.alt,

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
    ${SEO_PROJECTION},
    heroHeadline,
    heroBody,

    securityHeading,
    securityBody,
    "securityBadgesImageUrl": securityBadgesImage.asset->url,
    "securityBadgesImageAlt": securityBadgesImage.alt,
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
    "aiImageUrl": aiImage.asset->url,
    "aiImageAlt": aiImage.alt,

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
    ${SEO_PROJECTION},
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
    "heroImage": heroImage { asset->, ... },
    "heroImageUrl": heroImage.asset->url,
    dimensionsSectionHeading,
    dimensionsSectionBody,
    "dimensionsSectionImage": dimensionsSectionImage { asset->, ... },
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
    "bespokeSectionImage": bespokeSectionImage { asset->, ... },
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
