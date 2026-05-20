'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Locale, getLocalizedString, getLocalizedSlug } from '@/lib/i18n'
import { urlForImage } from '@/lib/sanity.client'
import MasonryGrid from '@/components/MasonryGrid'
import ImageWithBorder from '@/components/ImageWithBorder'
import type { ImageAsset } from '@/lib/sanity.queries'

interface HomeContentProps {
  featuredImages: ImageAsset[]
  locale: Locale
}

export default function HomeContent({ featuredImages, locale }: HomeContentProps) {
  const [selectedImage, setSelectedImage] = useState<ImageAsset | null>(
    featuredImages[0] || null
  )
  const [isSpotlightLoading, setIsSpotlightLoading] = useState(false)

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
    <section className="py-8 md:py-0">
      {/* Mobile Layout - Stacked */}
      <div className="lg:hidden container">
        {/* Selected Image - Top on Mobile */}
        {selectedImage && (
          <div className="mb-8">
            <Link href={`/${locale}/projects/${selectedProjectSlug}`}>
              <div className="frame-wood">
                <div className="frame-mat">
                  <div className="relative overflow-hidden">
                    <Image
                      src={urlForImage(selectedImage.image).width(1200).url()}
                      alt={selectedCaption || selectedProjectTitle || 'Photography'}
                      width={1200}
                      height={800}
                      className={`w-full h-auto object-cover transition-[filter] duration-500 ${
                        isSpotlightLoading ? 'blur-lg' : 'blur-0'
                      }`}
                      priority
                      placeholder={selectedImage.image.metadata?.lqip ? 'blur' : 'empty'}
                      blurDataURL={selectedImage.image.metadata?.lqip}
                      onLoad={() => setIsSpotlightLoading(false)}
                    />
                  </div>
                </div>
              </div>
            </Link>
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
        )}

        {/* Grid - Bottom on Mobile */}
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
                className={`mb-4 md:mb-6 block w-full text-left transition-opacity ${
                  isSelected ? 'ring-2 ring-primary' : 'opacity-60 hover:opacity-100'
                }`}
              >
                <ImageWithBorder
                  image={imageAsset.image}
                  alt={caption || projectTitle || 'Photography'}
                  medium={imageAsset.medium}
                  filmFormat={imageAsset.filmFormat}
                  sizes="(max-width: 640px) 100vw, 50vw"
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

      {/* Desktop Layout - Split Screen */}
      <div className="hidden lg:flex h-screen sticky top-0">
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
                  className={`mb-6 block w-full text-left transition-all ring-0 ${
                    isSelected ? 'scale-105' : 'opacity-90 hover:opacity-100 hover:scale-102'
                  }`}
                >
                  <ImageWithBorder
                    image={imageAsset.image}
                    alt={caption || projectTitle || 'Photography'}
                    medium={imageAsset.medium}
                    filmFormat={imageAsset.filmFormat}
                    sizes="40vw"
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
          {selectedImage && (
            <Link href={`/${locale}/projects/${selectedProjectSlug}`} className="w-full h-full flex flex-col">
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col">
                  <div className="frame-wood max-w-full max-h-full">
                    <div className="frame-mat">
                      <div className="relative">
                        <Image
                          src={urlForImage(selectedImage.image).width(1600).url()}
                          alt={selectedCaption || selectedProjectTitle || 'Photography'}
                          width={1600}
                          height={1200}
                          className={`w-full h-auto object-contain max-h-[60vh] transition-[filter] duration-500 ${
                            isSpotlightLoading ? 'blur-lg' : 'blur-0'
                          }`}
                          priority
                          placeholder={selectedImage.image.metadata?.lqip ? 'blur' : 'empty'}
                          blurDataURL={selectedImage.image.metadata?.lqip}
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
          )}
        </div>
      </div>
    </section>
  )
}
