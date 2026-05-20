import type { Metadata } from 'next'
import { urlForImage } from './sanity.client'
import type { SanityImage } from './types'

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://carmenballve.com'

export const SITE_NAME = 'Carmen Ballvé'

export const DEFAULT_DESCRIPTION = {
  en: 'Carmen Ballvé is a documentary and portrait photographer specializing in black-and-white film projects across Latin America and beyond.',
  es: 'Carmen Ballvé es una fotógrafa documental y de retrato especializada en proyectos de película en blanco y negro en América Latina y más allá.',
} as const

export const TWITTER_HANDLE = '@carmenballve'

type Locale = 'en' | 'es'

interface BuildMetadataInput {
  /** Page-specific title (will be templated with site name in the parent layout). */
  title?: string
  /** Page description (~150–160 chars for best SEO). */
  description?: string
  /** Path on the EN site without leading slash, e.g. "about" or "projects/foo". */
  pathEn: string
  /** Path on the ES site without leading slash. Defaults to the EN path. */
  pathEs?: string
  /** Current locale. Determines canonical and OG locale. */
  locale: Locale
  /** Sanity image to use as the social/OG image, optional. */
  image?: SanityImage
  /** Fallback explicit OG image URL if not using a Sanity image. */
  imageUrl?: string
  /** Open Graph type, e.g. 'website' (default) or 'article' for projects. */
  ogType?: 'website' | 'article'
  /** Disable indexing for this page (e.g. cart, success). */
  noIndex?: boolean
}

/**
 * Build a `Metadata` object for a page with full Open Graph, Twitter,
 * canonical, and hreflang alternates. Pass to `generateMetadata`.
 */
export function buildMetadata(input: BuildMetadataInput): Metadata {
  const {
    title,
    description,
    pathEn,
    pathEs = pathEn,
    locale,
    image,
    imageUrl,
    ogType = 'website',
    noIndex,
  } = input

  const resolvedDescription = description || DEFAULT_DESCRIPTION[locale]

  const localeUrl = (l: Locale) =>
    `${SITE_URL}/${l}${l === 'en' ? `/${pathEn}` : `/${pathEs}`}`.replace(
      /\/+$/,
      ''
    )

  const canonical = localeUrl(locale)

  // Build OG image: prefer Sanity image (resized to a social-friendly 1200×630
  // crop) then explicit URL, then the site default at /og-default.jpg.
  const ogImage = image
    ? urlForImage(image)
        .width(1200)
        .height(630)
        .fit('crop')
        .url()
    : imageUrl || `${SITE_URL}/og-default.jpg`

  const meta: Metadata = {
    title,
    description: resolvedDescription,
    alternates: {
      canonical,
      languages: {
        en: localeUrl('en'),
        es: localeUrl('es'),
      },
    },
    openGraph: {
      type: ogType,
      siteName: SITE_NAME,
      title: title || SITE_NAME,
      description: resolvedDescription,
      url: canonical,
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      alternateLocale: locale === 'es' ? ['en_US'] : ['es_ES'],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title || SITE_NAME,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title || SITE_NAME,
      description: resolvedDescription,
      images: [ogImage],
      creator: TWITTER_HANDLE,
      site: TWITTER_HANDLE,
    },
  }

  if (noIndex) {
    meta.robots = { index: false, follow: false }
  }

  return meta
}

/**
 * Extract a plain-text description from a portable-text array, trimmed to
 * `maxLength` characters at a word boundary. Returns '' if empty.
 */
export function extractPortableTextSummary(
  blocks:
    | { _type: string; children?: { text?: string }[] }[]
    | undefined,
  maxLength = 160
): string {
  if (!blocks || blocks.length === 0) return ''
  const text = blocks
    .filter((b) => b._type === 'block')
    .map((b) => (b.children || []).map((c) => c.text || '').join(''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length <= maxLength) return text
  const truncated = text.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '…'
}
