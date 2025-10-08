'use client'

import Image from 'next/image'
import { urlForImage } from '@/lib/sanity.client'
import type { SanityImage } from '@/lib/sanity.queries'

interface ImageWithBorderProps {
  image: SanityImage
  alt: string
  medium: 'film-bw' | 'digital-bw'
  filmFormat?: '35mm' | '120' | 'none'
  priority?: boolean
  sizes?: string
  className?: string
  width?: number
  height?: number
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
  width = 800,
  height = 1200,
  onLoad,
  caption,
  location,
  projectTitle,
  thumbnail = false,
}: ImageWithBorderProps) {
  // Determine border class based on medium and format
  const getBorderClass = () => {
    if (medium === 'digital-bw') {
      return 'image-digital'
    }
    if (medium === 'film-bw') {
      if (filmFormat === '35mm') {
        return 'image-film-35mm'
      }
      if (filmFormat === '120') {
        return 'image-film-120'
      }
    }
    return 'image-digital' // fallback
  }

  const borderClass = getBorderClass()
  const imageUrl = urlForImage(image).width(width).url()
  const blurDataURL = image.metadata?.lqip
  const hasOverlay = caption || location || projectTitle

  return (
    <div className={`${borderClass} ${className} group`}>
      <div className="relative overflow-hidden">
        <Image
          src={imageUrl}
          alt={alt}
          width={width}
          height={height}
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
