import { cache } from 'react'
import { client } from './sanity.client'
import type {
  LocalizedString,
  LocalizedSlug,
  LocalizedText,
  PortableTextBlock,
  SanityImage,
  Project,
  ImageAsset,
  ImageMedium,
  DatePrecision,
  Location,
  Product,
  ProductVariant,
  SiteSettings,
  FeaturedProject,
  SocialLink,
} from './types'

// Re-export types for convenience
export type {
  LocalizedString,
  LocalizedSlug,
  LocalizedText,
  PortableTextBlock,
  SanityImage,
  Project,
  ImageAsset,
  ImageMedium,
  DatePrecision,
  Location,
  Product,
  ProductVariant,
  SiteSettings,
  FeaturedProject,
  SocialLink,
}

// Standard projection for location references
const LOCATION_PROJECTION = `locations[]->{ _id, _type, name, slug }`

// Inline image projection: expands `asset.metadata` (dimensions for
// aspect-ratio reservation, lqip for blur placeholder, etc.) so consumers
// don't have to dereference the asset separately. Keep this inline in the
// queries we hot-path; static project images can stay as `featuredImage,`
// since they already have aspect-[3/2] containers.
const IMAGE_WITH_METADATA = `{
  ...,
  asset->{
    _id,
    metadata { dimensions, lqip, blurhash, palette }
  }
}`

// Cache revalidation: no cache in development, 3600s in production
const REVALIDATE = process.env.NODE_ENV === 'development' ? 0 : 3600

// Query functions. Each wrapped with React `cache()` so calling the same
// function with the same arguments during one render (e.g. once in
// generateMetadata and once in the page component) only fetches Sanity once.
export const getAllProjects = cache(async function getAllProjects(): Promise<Project[]> {
  const query = `*[_type == "project"] | order(order asc) {
    _id,
    _type,
    title,
    slug,
    startYear,
    endYear,
    isOngoing,
    ${LOCATION_PROJECTION},
    description,
    featuredImage,
    primaryMedium,
    collaborators,
    publications,
    isFeatured,
    "images": *[_type == "imageAsset" && references(^._id)] | order(order asc),
    order
  }`

  return client.fetch(query, {}, { next: { revalidate: REVALIDATE } })
})

export const getProjectBySlug = cache(async function getProjectBySlug(slug: string, locale: string = 'en'): Promise<Project | null> {
  const query = `*[_type == "project" && slug.${locale}.current == $slug][0] {
    _id,
    _type,
    title,
    slug,
    startYear,
    endYear,
    isOngoing,
    ${LOCATION_PROJECTION},
    description,
    featuredImage,
    primaryMedium,
    collaborators,
    publications,
    isFeatured,
    "images": *[_type == "imageAsset" && references(^._id)] | order(order asc) {
      _id,
      image,
      caption,
      medium,
      filmFormat,
      date,
      datePrecision,
      tags,
      availableAsPrint,
      order
    },
    order
  }`

  return client.fetch(query, { slug }, { next: { revalidate: REVALIDATE } })
})

export const getFeaturedImages = cache(async function getFeaturedImages(): Promise<ImageAsset[]> {
  const query = `*[_type == "imageAsset" && isFeatured == true] {
    _id,
    image${IMAGE_WITH_METADATA},
    caption,
    medium,
    filmFormat,
    date,
    datePrecision,
    project->{
      _id,
      title,
      slug,
      ${LOCATION_PROJECTION},
      startYear,
      endYear,
      isOngoing
    }
  }`

  return client.fetch(query, {}, { next: { revalidate: REVALIDATE } })
})

export const getAllImages = cache(async function getAllImages(): Promise<ImageAsset[]> {
  const query = `*[_type == "imageAsset"] | order(project->startYear desc, order asc) {
    _id,
    image${IMAGE_WITH_METADATA},
    caption,
    medium,
    filmFormat,
    date,
    datePrecision,
    tags,
    project->{
      _id,
      title,
      slug,
      ${LOCATION_PROJECTION},
      startYear,
      endYear,
      isOngoing
    }
  }`

  return client.fetch(query, {}, { next: { revalidate: REVALIDATE } })
})

export const getSiteSettings = cache(async function getSiteSettings(): Promise<SiteSettings> {
  const query = `*[_type == "siteSettings"][0] {
    _id,
    siteName,
    aboutBio,
    aboutImage,
    contactEmail,
    socialLinks,
    exhibitions,
    awards,
    "featuredProjects": featuredProjects[]->  {
      _id,
      title,
      slug,
      startYear,
      endYear,
      isOngoing,
      ${LOCATION_PROJECTION},
      featuredImage,
      description
    }
  }`

  return client.fetch(query, {}, { next: { revalidate: REVALIDATE } })
})

export const getAllProducts = cache(async function getAllProducts(): Promise<Product[]> {
  const query = `*[_type == "product"] | order(coalesce(order, 9999) asc, _createdAt desc) {
    _id,
    title,
    slug,
    images,
    description,
    price,
    stripeProductId,
    relatedProject,
    inStock,
    variants,
    order
  }`

  return client.fetch(query, {}, { next: { revalidate: REVALIDATE } })
})

export const getProductBySlug = cache(async function getProductBySlug(slug: string, locale: string = 'en'): Promise<Product | null> {
  const query = `*[_type == "product" && slug.${locale}.current == $slug][0] {
    _id,
    title,
    slug,
    images,
    description,
    price,
    stripeProductId,
    relatedProject->{
      _id,
      title,
      slug
    },
    inStock,
    variants
  }`

  return client.fetch(query, { slug }, { next: { revalidate: REVALIDATE } })
})
