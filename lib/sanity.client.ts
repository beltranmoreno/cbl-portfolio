import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import type { SanityImage, SanityImageDimensions } from './types'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
  token: process.env.SANITY_API_TOKEN,
})

const builder = imageUrlBuilder(client)

export function urlForImage(source: SanityImageSource) {
  return builder.image(source).auto('format').fit('max')
}

/**
 * Pull dimensions + placeholder data from either the dereferenced asset
 * (new-style queries) or the inline image metadata (legacy projections).
 */
export function getImageMeta(image: SanityImage | undefined): {
  dimensions?: SanityImageDimensions
  lqip?: string
  blurhash?: string
} {
  if (!image) return {}
  const assetMeta = image.asset?.metadata
  const inlineMeta = image.metadata
  return {
    dimensions: assetMeta?.dimensions,
    lqip: assetMeta?.lqip ?? inlineMeta?.lqip,
    blurhash: assetMeta?.blurhash ?? inlineMeta?.blurhash,
  }
}
