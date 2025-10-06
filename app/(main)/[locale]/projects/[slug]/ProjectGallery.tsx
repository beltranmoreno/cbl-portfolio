'use client'

import { useState } from 'react'
import { Locale, getLocalizedField } from '@/lib/i18n'
import type { ImageAsset } from '@/lib/sanity.queries'
import MasonryGrid from '@/components/MasonryGrid'
import ImageWithBorder from '@/components/ImageWithBorder'
import Lightbox from '@/components/Lightbox'

interface ProjectGalleryProps {
  images: ImageAsset[]
  locale: Locale
  availableAsPrintText: string
}

export default function ProjectGallery({
  images,
  locale,
  availableAsPrintText,
}: ProjectGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  return (
    <>
      <MasonryGrid>
        {images.map((imageAsset, index) => {
          const caption = getLocalizedField(imageAsset, 'caption', locale)

          return (
            <button
              key={imageAsset._id}
              onClick={() => openLightbox(index)}
              className="mb-4 md:mb-6 block w-full text-left group cursor-pointer"
            >
              <div className="relative overflow-hidden">
                <div className="image-hover">
                  <ImageWithBorder
                    image={imageAsset.image}
                    alt={caption || 'Photography'}
                    medium={imageAsset.medium}
                    filmFormat={imageAsset.filmFormat}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>

                {/* Caption overlay on hover */}
                {caption && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                    <p className="text-white text-center font-sans text-sm">
                      {caption}
                    </p>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </MasonryGrid>

      {lightboxOpen && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          locale={locale}
          availableAsPrintText={availableAsPrintText}
        />
      )}
    </>
  )
}
