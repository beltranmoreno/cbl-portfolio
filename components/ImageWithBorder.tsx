'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { urlForImage, getImageMeta } from '@/lib/sanity.client'
import type { SanityImage, ImageMedium } from '@/lib/sanity.queries'

interface ImageWithBorderProps {
  image: SanityImage
  alt: string
  medium: ImageMedium
  filmFormat?: '35mm' | '120' | 'none'
  priority?: boolean
  sizes?: string
  className?: string
  /** Max width to request from Sanity. Lower = smaller payload. */
  maxWidth?: number
  onLoad?: () => void
  caption?: string
  location?: string
  projectTitle?: string
  thumbnail?: boolean
}

export default function ImageWithBorder({
  image,
  alt,
  medium,
  filmFormat = 'none',
  priority = false,
  sizes = '100vw',
  className = '',
  maxWidth = 1200,
  onLoad,
  caption,
  location,
  projectTitle,
  thumbnail = false,
}: ImageWithBorderProps) {
  // Pull dimensions + lqip from the asset (new projection) or fall back to
  // the inline image-level metadata.
  const meta = getImageMeta(image)
  const realWidth = meta.dimensions?.width
  const realHeight = meta.dimensions?.height

  // Use the asset's actual dimensions when we have them so Next.js reserves
  // the correct aspect-ratio box and the page doesn't shift on load. Fall
  // back to a 2:3 portrait sketch if dimensions aren't projected.
  const imgWidth = realWidth ?? 800
  const imgHeight = realHeight ?? 1200

  // Generate random variation based on image asset ID for consistency
  const variation = useMemo(() => {
    const ref = image.asset?._ref || image.asset?._id || ''
    const hash = ref.split('-')[1] || ''
    const num = parseInt(hash.substring(0, 8), 16) % 5 + 1
    return Number.isNaN(num) ? 1 : num
  }, [image.asset?._ref, image.asset?._id])

  // Determine border class based on medium and format. Color/B&W share the
  // same borders since the border represents the capture medium (film vs digital).
  const getBorderClass = () => {
    const isFilm = medium === 'film-bw' || medium === 'film-color'
    let baseClass = 'image-digital'

    if (isFilm) {
      if (filmFormat === '35mm') baseClass = 'image-film-35mm'
      else if (filmFormat === '120') baseClass = 'image-film-120'
    }

    return `${baseClass} ${baseClass}-v${variation}`
  }

  const borderClass = getBorderClass()
  // Source URL caps at maxWidth — Next.js will pick smaller srcset entries
  // from there based on `sizes`. No reason to fetch beyond ~1200px for a
  // masonry thumbnail; the source url is the upper bound.
  const imageUrl = urlForImage(image).width(maxWidth).url()
  const blurDataURL = meta.lqip
  const hasOverlay = caption || location || projectTitle

  return (
    <div className={`${borderClass} ${className} group`}>
      <div className="relative overflow-hidden">
        <Image
          src={imageUrl}
          alt={alt}
          width={imgWidth}
          height={imgHeight}
          sizes={sizes}
          priority={priority}
          placeholder={blurDataURL ? 'blur' : 'empty'}
          blurDataURL={blurDataURL}
          className="w-full h-auto object-cover"
          onLoad={onLoad}
        />
        {hasOverlay && !thumbnail && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-24 pb-4 px-4 md:px-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            {caption && (
              <p className="text-white font-serif text-base md:text-lg leading-relaxed mb-2">
                {caption}
              </p>
            )}
            {(location || projectTitle) && (
              <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-white/80 text-xs md:text-sm">
                {projectTitle && <span>{projectTitle}</span>}
                {location && projectTitle && <span>•</span>}
                {location && <span>{location}</span>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
