'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { urlForImage } from '@/lib/sanity.client'
import type { ImageAsset } from '@/lib/sanity.queries'
import { Locale, getLocalizedField } from '@/lib/i18n'

interface LightboxProps {
  images: ImageAsset[]
  currentIndex: number
  onClose: () => void
  locale: Locale
  availableAsPrintText: string
}

export default function Lightbox({
  images,
  currentIndex,
  onClose,
  locale,
  availableAsPrintText,
}: LightboxProps) {
  const [index, setIndex] = useState(currentIndex)
  const [showInfo, setShowInfo] = useState(false)

  const currentImage = images[index]

  const goToNext = useCallback(() => {
    setIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const goToPrevious = useCallback(() => {
    setIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
      if (e.key === 'i' || e.key === 'I') setShowInfo((prev) => !prev)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNext, goToPrevious, onClose])

  const caption = String(getLocalizedField(currentImage, 'caption', locale))

  return (
    <div
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white hover:text-neutral-300 transition-colors p-2"
        aria-label="Close lightbox"
      >
        <svg
          className="w-8 h-8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Previous Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          goToPrevious()
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-neutral-300 transition-colors p-4 z-10"
        aria-label="Previous image"
      >
        <svg
          className="w-12 h-12"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Next Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          goToNext()
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-neutral-300 transition-colors p-4 z-10"
        aria-label="Next image"
      >
        <svg
          className="w-12 h-12"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Main Image */}
      <div
        className="relative w-full h-full flex items-center justify-center p-16"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={urlForImage(currentImage.image).width(1920).url()}
          alt={caption as string || 'Photography'}
          width={1920}
          height={1080}
          className="max-w-full max-h-full object-contain"
          priority
        />
      </div>

      {/* Info Panel */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setShowInfo(!showInfo)
        }}
        className="absolute bottom-4 left-4 text-white hover:text-neutral-300 transition-colors text-sm z-10"
      >
        {showInfo ? 'Hide Info' : 'Show Info'}
      </button>

      {showInfo && (
        <div
          className="absolute bottom-16 left-4 bg-black/90 text-white p-6 max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {caption && <p className="font-serif text-lg mb-2">{caption}</p>}
          <p className="text-sm text-neutral-300 mb-1">
            {currentImage.medium === 'film-bw' ? 'Film' : 'Digital'} •{' '}
            {currentImage.filmFormat && currentImage.filmFormat !== 'none'
              ? currentImage.filmFormat
              : 'Black & White'}
          </p>
          {currentImage.availableAsPrint && (
            <button className="mt-4 px-4 py-2 bg-primary text-white text-sm hover:bg-primary-dark transition-colors">
              {availableAsPrintText}
            </button>
          )}
        </div>
      )}

      {/* Image Counter */}
      <div className="absolute bottom-4 right-4 text-white text-sm z-10">
        {index + 1} / {images.length}
      </div>
    </div>
  )
}
