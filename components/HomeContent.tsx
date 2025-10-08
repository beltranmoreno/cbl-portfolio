'use client'

import { useState } from 'react'
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

  const handleImageClick = (image: ImageAsset) => {
    setSelectedImage(image)
  }

  const selectedCaption = selectedImage ? getLocalizedString(selectedImage.caption, locale) : ''
  const selectedProjectTitle = selectedImage ? getLocalizedString(selectedImage.project.title, locale) : ''
  const selectedLocation = selectedImage?.project?.locations?.[0] || ''
  const selectedProjectSlug = selectedImage ? getLocalizedSlug(selectedImage.project.slug, locale)?.current || '' : ''

  return (
    <section className="py-8 md:py-0">
      {/* Mobile Layout - Stacked */}
      <div className="lg:hidden container">
        {/* Selected Image - Top on Mobile */}
        {selectedImage && (
          <div className="mb-8">
            <Link href={`/${locale}/projects/${selectedProjectSlug}`}>
              <div className="image-digital">
                <div className="relative overflow-hidden">
                  <Image
                    src={urlForImage(selectedImage.image).width(1200).url()}
                    alt={selectedCaption || selectedProjectTitle || 'Photography'}
                    width={1200}
                    height={800}
                    className="w-full h-auto object-cover"
                    priority
                    placeholder={selectedImage.image.metadata?.lqip ? 'blur' : 'empty'}
                    blurDataURL={selectedImage.image.metadata?.lqip}
                  />
                </div>
              </div>
            </Link>
            {/* Image Info */}
            <div className="mt-4 space-y-2">
              {selectedCaption && (
                <p className="font-serif text-lg text-neutral-900">
                  {selectedCaption}
                </p>
              )}
              <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-neutral-600 text-sm">
                {selectedProjectTitle && <span className="font-medium">{selectedProjectTitle}</span>}
                {selectedLocation && selectedProjectTitle && <span>•</span>}
                {selectedLocation && <span>{selectedLocation}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Grid - Bottom on Mobile */}
        <MasonryGrid>
          {featuredImages.map((imageAsset) => {
            const projectTitle = getLocalizedString(imageAsset.project.title, locale)
            const caption = getLocalizedString(imageAsset.caption, locale)
            const location = imageAsset.project?.locations?.[0] || ''
            const isSelected = selectedImage?._id === imageAsset._id

            return (
              <button
                key={imageAsset._id}
                onClick={() => handleImageClick(imageAsset)}
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
        <div className="w-1/2 overflow-y-auto px-6 py-8">
          <MasonryGrid>
            {featuredImages.map((imageAsset) => {
              const projectTitle = getLocalizedString(imageAsset.project.title, locale)
              const caption = getLocalizedString(imageAsset.caption, locale)
              const location = imageAsset.project?.locations?.[0] || ''
              const isSelected = selectedImage?._id === imageAsset._id

              return (
                <button
                  key={imageAsset._id}
                  onClick={() => handleImageClick(imageAsset)}
                  className={`mb-6 block w-full text-left transition-all ${
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
        <div className="w-1/2 flex items-center justify-center bg-neutral-50 p-12 sticky top-0 h-[calc(100vh-var(--nav-height))]">
          {selectedImage && (
            <Link href={`/${locale}/projects/${selectedProjectSlug}`} className="w-full h-full flex flex-col">
              <div className="flex-1 flex items-center justify-center">
                <div className="image-digital max-w-full max-h-full">
                  <div className="relative">
                    <Image
                      src={urlForImage(selectedImage.image).width(1600).url()}
                      alt={selectedCaption || selectedProjectTitle || 'Photography'}
                      width={1600}
                      height={1200}
                      className="w-full h-auto object-contain max-h-[70vh]"
                      priority
                      placeholder={selectedImage.image.metadata?.lqip ? 'blur' : 'empty'}
                      blurDataURL={selectedImage.image.metadata?.lqip}
                    />
                  </div>
                </div>
              </div>

              {/* Image Info */}
              <div className="mt-2 space-y-3 text-center">
                {selectedCaption && (
                  <p className="font-serif text-2xl text-neutral-900">
                    {selectedCaption}
                  </p>
                )}
                <div className="flex justify-center flex-wrap gap-x-3 gap-y-1 text-neutral-600 text-base">
                  {selectedProjectTitle && <span className="font-medium">{selectedProjectTitle}</span>}
                  {selectedLocation && selectedProjectTitle && <span>•</span>}
                  {selectedLocation && <span>{selectedLocation}</span>}
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
