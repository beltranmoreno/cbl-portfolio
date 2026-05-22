'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Locale, getLocalizedString, getLocalizedSlug } from '@/lib/i18n'
import { urlForImage, getImageMeta } from '@/lib/sanity.client'
import MasonryGrid from '@/components/MasonryGrid'
import ImageWithBorder from '@/components/ImageWithBorder'
import Lightbox from '@/components/Lightbox'
import type { ImageAsset } from '@/lib/sanity.queries'

interface HomeContentProps {
  featuredImages: ImageAsset[]
  locale: Locale
  availableAsPrintText: string
}

export default function HomeContent({ featuredImages, locale, availableAsPrintText }: HomeContentProps) {
  const [selectedImage, setSelectedImage] = useState<ImageAsset | null>(
    featuredImages[0] || null
  )
  const [isSpotlightLoading, setIsSpotlightLoading] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const selectImage = (image: ImageAsset) => {
    if (selectedImage?._id === image._id) return
    setIsSpotlightLoading(true)
    setSelectedImage(image)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return

      const currentIndex = featuredImages.findIndex((img) => img._id === selectedImage._id)
      if (currentIndex === -1) return

      let newIndex = currentIndex

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault()
          newIndex = (currentIndex + 1) % featuredImages.length
          break
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault()
          newIndex = (currentIndex - 1 + featuredImages.length) % featuredImages.length
          break
        default:
          return
      }

      selectImage(featuredImages[newIndex])
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImage, featuredImages])

  const selectedCaption = selectedImage ? getLocalizedString(selectedImage.caption, locale) : ''
  const selectedProjectTitle = selectedImage ? getLocalizedString(selectedImage.project.title, locale) : ''
  const selectedProjectSlug = selectedImage ? getLocalizedSlug(selectedImage.project.slug, locale)?.current || '' : ''

  return (
    <section className="relative py-8 md:py-0 ">
      {/* Mobile Layout — masonry only; tap an image to open the lightbox */}
      <div className="md:hidden container mb-16">
        <MasonryGrid>
          {featuredImages.map((imageAsset, index) => {
            const projectTitle = getLocalizedString(imageAsset.project.title, locale)
            const caption = getLocalizedString(imageAsset.caption, locale)
            const firstLoc = imageAsset.project?.locations?.[0]
            const location = firstLoc ? getLocalizedString(firstLoc.name, locale) : ''

            return (
              <button
                key={imageAsset._id}
                onClick={() => setLightboxIndex(index)}
                className="mb-4 md:mb-6 block w-full text-left active:opacity-90 transition-opacity"
                aria-label={
                  caption
                    ? `${caption} — ${projectTitle}`
                    : projectTitle || 'Photograph'
                }
              >
                <ImageWithBorder
                  image={imageAsset.image}
                  alt={caption || projectTitle || 'Photography'}
                  medium={imageAsset.medium}
                  filmFormat={imageAsset.filmFormat}
                  sizes="50vw"
                  maxWidth={600}
                  caption={caption}
                  location={location}
                  projectTitle={projectTitle}
                  thumbnail={true}
                />
              </button>
            )
          })}
        </MasonryGrid>
      </div>

      {/* Mobile-only bottom fade — dissolves the masonry into the white
          about section below. On mobile the section is content-height, so
          this sits at the end of the masonry. */}
      <div
        aria-hidden="true"
        className="md:hidden pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent via-white/70 to-white"
      />

      {/* Desktop Layout - Split Screen */}
      <div className="hidden md:flex h-screen sticky top-0">
        {/* Left: Masonry Grid - 50% */}
        <div className="w-1/2 overflow-y-auto scrollbar-hide px-6 py-8">
          <MasonryGrid>
            {featuredImages.map((imageAsset) => {
              const projectTitle = getLocalizedString(imageAsset.project.title, locale)
              const caption = getLocalizedString(imageAsset.caption, locale)
              const firstLoc = imageAsset.project?.locations?.[0]
              const location = firstLoc ? getLocalizedString(firstLoc.name, locale) : ''
              const isSelected = selectedImage?._id === imageAsset._id

              return (
                <button
                  key={imageAsset._id}
                  onClick={() => selectImage(imageAsset)}
                  className={`mb-6 block w-full text-left transition-opacity ${
                    isSelected ? 'opacity-100' : 'opacity-95 hover:opacity-100 hover:cursor-pointer'
                  }`}
                >
                  <ImageWithBorder
                    image={imageAsset.image}
                    alt={caption || projectTitle || 'Photography'}
                    medium={imageAsset.medium}
                    filmFormat={imageAsset.filmFormat}
                    sizes="(min-width: 1536px) 12vw, (min-width: 1280px) 17vw, 25vw"
                    maxWidth={600}
                    caption={caption}
                    location={location}
                    projectTitle={projectTitle}
                    thumbnail={true}
                  />
                </button>
              )
            })}
          </MasonryGrid>
        </div>

        {/* Right: Spotlight Image - 50% */}
        <div className="w-1/2 flex items-center justify-center bg-neutral-50 p-12 sticky top-0 h-100vh">
          {selectedImage && (() => {
            const spotMeta = getImageMeta(selectedImage.image)
            const spotW = spotMeta.dimensions?.width ?? 1600
            const spotH = spotMeta.dimensions?.height ?? 1200
            return (
            <Link href={`/${locale}/projects/${selectedProjectSlug}`} className="w-full h-full flex flex-col">
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col">
                  <div className="frame-wood max-w-full max-h-full">
                    <div className="frame-mat">
                      <div className="relative">
                        <Image
                          src={urlForImage(selectedImage.image).width(1600).url()}
                          alt={selectedCaption || selectedProjectTitle || 'Photography'}
                          width={spotW}
                          height={spotH}
                          sizes="(min-width: 1536px) 40vw, 45vw"
                          className={`w-full h-auto object-contain max-h-[60vh] transition-[filter] duration-500 ${
                            isSpotlightLoading ? 'blur-lg' : 'blur-0'
                          }`}
                          priority
                          placeholder={spotMeta.lqip ? 'blur' : 'empty'}
                          blurDataURL={spotMeta.lqip}
                          onLoad={() => setIsSpotlightLoading(false)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Wall placard */}
                  <div className="mt-3 text-right">
                    {selectedCaption && (
                      <p className="font-serif italic text-base text-neutral-800 leading-tight">
                        {selectedCaption}
                      </p>
                    )}
                    {selectedProjectTitle && (
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-neutral-500">
                        {selectedProjectTitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
            )
          })()}
        </div>
      </div>

      {/* Mobile lightbox — opened when a thumbnail is tapped */}
      {lightboxIndex !== null && (
        <Lightbox
          images={featuredImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          locale={locale}
          availableAsPrintText={availableAsPrintText}
        />
      )}
    </section>
  )
}
