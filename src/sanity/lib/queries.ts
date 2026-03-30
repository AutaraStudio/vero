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
    _id,
    name,
    "slug": slug.current,
    keyDimensionsAssessed,
    heroHeadline,
    heroIntroCopy,
    "heroImage": heroImage { asset->, ... },
    dimensionsSectionHeading,
    dimensionsSectionBody,
    "dimensionsSectionImage": dimensionsSectionImage { asset->, ... },
    inActionSectionHeading,
    inActionSectionSubheading,
    "inActionSectionImage": inActionSectionImage { asset->, ... },
    assessmentsBlockHeading,
    assessmentsBlockBody,
    portalBlockHeading,
    portalBlockBody,
    interviewBlockHeading,
    interviewBlockBody,
    stat1Heading,
    stat1Body,
    stat2Heading,
    stat2Body,
    stat3Heading,
    stat3Body,
    roleRosterHeading,
    roleRosterSubheading,
    bespokeSectionHeading,
    bespokeSectionBody,
    bespokeCTALabel,
    "bespokeSectionImage": bespokeSectionImage { asset->, ... },
    "roles": *[_type == "role" && parentCategory._ref == ^._id] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      tasks,
      strengths
    }
  }
`

export const JOB_CATEGORY_SLUGS_QUERY = `
  *[_type == "jobCategory"] { "slug": slug.current }
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
      strengths
    }
  }
`
