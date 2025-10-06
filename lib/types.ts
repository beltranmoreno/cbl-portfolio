// Application-level types for the Carmen Ballvé Portfolio

/**
 * Localized string type - contains both English and Spanish versions
 */
export interface LocalizedString {
  en: string
  es: string
}

/**
 * Localized slug type - contains both English and Spanish URL slugs
 */
export interface LocalizedSlug {
  en: { current: string }
  es: { current: string }
}

/**
 * Portable Text block structure from Sanity
 */
export interface PortableTextBlock {
  _type: 'block'
  children: Array<{
    _type: string
    text: string
    marks?: string[]
  }>
  style?: string
  markDefs?: Array<{
    _key: string
    _type: string
  }>
}

/**
 * Localized Portable Text - rich text content in both languages
 */
export interface LocalizedText {
  en: PortableTextBlock[]
  es: PortableTextBlock[]
}

/**
 * Sanity image asset reference
 */
export interface SanityImage {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
  hotspot?: {
    x: number
    y: number
  }
  metadata?: {
    lqip?: string
    blurhash?: string
    palette?: {
      dominant?: {
        background?: string
        foreground?: string
      }
    }
  }
}

/**
 * Photography project
 */
export interface Project {
  _id: string
  _type: 'project'
  title: LocalizedString
  slug: LocalizedSlug
  startYear: number
  endYear?: number
  isOngoing: boolean
  locations?: string[]
  description: LocalizedText
  featuredImage: SanityImage
  primaryMedium: 'film-bw' | 'digital-bw' | 'mixed'
  collaborators?: string[]
  publications?: LocalizedString[]
  isFeatured: boolean
  order?: number
}

/**
 * Individual photograph/image asset
 */
export interface ImageAsset {
  _id: string
  _type: 'imageAsset'
  image: SanityImage
  caption: LocalizedString
  medium: 'film-bw' | 'digital-bw'
  filmFormat?: '35mm' | '120' | 'none'
  isFeatured: boolean
  project: {
    _id: string
    title: LocalizedString
    slug: LocalizedSlug
    locations?: string[]
    startYear: number
    endYear?: number
    isOngoing: boolean
  }
  tags?: string[]
  availableAsPrint: boolean
  order?: number
}

/**
 * Product variant (different sizes, formats, etc.)
 */
export interface ProductVariant {
  name: LocalizedString
  price: number
  stripePriceId?: string
  inStock: boolean
}

/**
 * Shop product (prints, books, etc.)
 */
export interface Product {
  _id: string
  _type: 'product'
  title: LocalizedString
  slug: LocalizedSlug
  images: SanityImage[]
  description: LocalizedText
  price: number
  stripeProductId?: string
  relatedProject?: {
    _id: string
    title: LocalizedString
    slug: LocalizedSlug
  }
  inStock: boolean
  variants?: ProductVariant[]
}

/**
 * Featured project for homepage (subset of Project)
 */
export interface FeaturedProject {
  _id: string
  title: LocalizedString
  slug: LocalizedSlug
  startYear: number
  endYear?: number
  isOngoing: boolean
  locations?: string[]
  featuredImage: SanityImage
  description: LocalizedText
}

/**
 * Social media link
 */
export interface SocialLink {
  platform: string
  url: string
}

/**
 * Site-wide settings
 */
export interface SiteSettings {
  _id: string
  _type: 'siteSettings'
  siteName: string
  aboutBio: LocalizedText
  aboutImage?: SanityImage
  contactEmail?: string
  socialLinks?: SocialLink[]
  featuredProjects?: FeaturedProject[]
}

/**
 * Translation keys for common UI strings
 */
export interface CommonTranslations {
  viewFullArchive: string
  featuredWork: string
  location: string
  year: string
  tags: string
  clearFilters: string
  showing: string
  noResults: string
  addToCart: string
  outOfStock: string
  viewDetails: string
  nextProject: string
  backToArchive: string
  projectsOverTime: string
  contact: string
  copyright: string
  availableAsPrint: string
  loadMore: string
  quantity: string
  subtotal: string
  checkout: string
  cart: string
  emptyCart: string
  price: string
  inStock: string
  soldOut: string
}

/**
 * Translation keys for navigation
 */
export interface NavigationTranslations {
  about: string
  archive: string
  shop: string
  home: string
}

/**
 * All translations combined
 */
export interface Translations {
  common: CommonTranslations
  navigation: NavigationTranslations
}
