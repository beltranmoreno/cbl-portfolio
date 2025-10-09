import { client } from './sanity.client'
import type {
  LocalizedString,
  LocalizedSlug,
  LocalizedText,
  PortableTextBlock,
  SanityImage,
  Project,
  ImageAsset,
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
  Product,
  ProductVariant,
  SiteSettings,
  FeaturedProject,
  SocialLink,
}

// Cache revalidation: no cache in development, 3600s in production
const REVALIDATE = process.env.NODE_ENV === 'development' ? 0 : 3600

// Query functions
export async function getAllProjects(): Promise<Project[]> {
  const query = `*[_type == "project"] | order(order asc) {
    _id,
    _type,
    title,
    slug,
    startYear,
    endYear,
    isOngoing,
    locations,
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
}

export async function getProjectBySlug(slug: string, locale: string = 'en'): Promise<Project | null> {
  const query = `*[_type == "project" && slug.${locale}.current == $slug][0] {
    _id,
    _type,
    title,
    slug,
    startYear,
    endYear,
    isOngoing,
    locations,
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
      tags,
      availableAsPrint,
      order
    },
    order
  }`

  return client.fetch(query, { slug }, { next: { revalidate: REVALIDATE } })
}

export async function getFeaturedImages(): Promise<ImageAsset[]> {
  const query = `*[_type == "imageAsset" && isFeatured == true] {
    _id,
    image,
    caption,
    medium,
    filmFormat,
    project->{
      _id,
      title,
      slug,
      locations,
      startYear,
      endYear,
      isOngoing
    }
  }`

  return client.fetch(query, {}, { next: { revalidate: REVALIDATE } })
}

export async function getAllImages(): Promise<ImageAsset[]> {
  const query = `*[_type == "imageAsset"] | order(project->startYear desc, order asc) {
    _id,
    image,
    caption,
    medium,
    filmFormat,
    tags,
    project->{
      _id,
      title,
      slug,
      locations,
      startYear,
      endYear,
      isOngoing
    }
  }`

  return client.fetch(query, {}, { next: { revalidate: REVALIDATE } })
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const query = `*[_type == "siteSettings"][0] {
    _id,
    siteName,
    aboutBio,
    aboutImage,
    contactEmail,
    socialLinks,
    "featuredProjects": featuredProjects[]->  {
      _id,
      title,
      slug,
      startYear,
      endYear,
      isOngoing,
      locations,
      featuredImage,
      description
    }
  }`

  return client.fetch(query, {}, { next: { revalidate: REVALIDATE } })
}

export async function getAllProducts(): Promise<Product[]> {
  const query = `*[_type == "product"] | order(_createdAt desc) {
    _id,
    title,
    slug,
    images,
    description,
    price,
    stripeProductId,
    relatedProject,
    inStock,
    variants
  }`

  return client.fetch(query, {}, { next: { revalidate: REVALIDATE } })
}

export async function getProductBySlug(slug: string, locale: string = 'en'): Promise<Product | null> {
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
}
