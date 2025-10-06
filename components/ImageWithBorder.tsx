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

  return (
    <div className={`${borderClass} ${className}`}>
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
    </div>
  )
}
