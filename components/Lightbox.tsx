'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { urlForImage } from '@/lib/sanity.client'
import type { ImageAsset } from '@/lib/sanity.queries'
import { Locale, getLocalizedField, formatImageDate } from '@/lib/i18n'

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
  const [showInfo, setShowInfo] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  const currentImage = images[index]

  const goToNext = useCallback(() => {
    setIsLoading(true)
    setIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const goToPrevious = useCallback(() => {
    setIsLoading(true)
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

  // Touch swipe to navigate
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const SWIPE_THRESHOLD = 50

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    touchStartX.current = t.clientX
    touchStartY.current = t.clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null || touchStartY.current == null) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchStartX.current
    const dy = t.clientY - touchStartY.current
    touchStartX.current = null
    touchStartY.current = null
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) goToPrevious()
      else goToNext()
    }
  }

  const caption = String(getLocalizedField(currentImage, 'caption', locale))

  // Derive metadata once so mobile + desktop layouts can share it.
  const isFilm = currentImage.medium.startsWith('film')
  const isColor = currentImage.medium.endsWith('color')
  const colorLabel = isColor
    ? locale === 'es' ? 'Color' : 'Color'
    : locale === 'es' ? 'Blanco y Negro' : 'Black & White'
  const mediumParts: string[] = [isFilm ? 'Film' : 'Digital']
  if (isFilm && currentImage.filmFormat && currentImage.filmFormat !== 'none') {
    mediumParts.push(currentImage.filmFormat)
  }
  mediumParts.push(colorLabel)
  const mediumLabel = mediumParts.join(' • ')
  const dateLabel = formatImageDate(currentImage.date, currentImage.datePrecision, locale)
  const counterLabel = `${index + 1} / ${images.length}`
  const toggleLabel = showInfo
    ? locale === 'es' ? 'Ocultar info' : 'Hide Info'
    : locale === 'es' ? 'Mostrar info' : 'Show Info'

  return (
    <div
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center touch-pan-y"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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
        className="absolute left-0 md:left-1 top-1/2 -translate-y-1/2 text-white hover:text-neutral-300 transition-colors p-2 md:p-4 z-10"
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
        className="absolute right-0 md:right-1 top-1/2 -translate-y-1/2 text-white hover:text-neutral-300 transition-colors p-2 md:p-4 z-10"
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
          key={index}
          src={urlForImage(currentImage.image).width(1920).url()}
          alt={caption as string || 'Photography'}
          width={1920}
          height={1080}
          className={`max-w-full max-h-full object-contain transition-[filter] duration-500 ${
            isLoading ? 'blur-lg' : 'blur-0'
          }`}
          priority
          placeholder={currentImage.image.metadata?.lqip ? 'blur' : 'empty'}
          blurDataURL={currentImage.image.metadata?.lqip}
          onLoad={() => setIsLoading(false)}
        />
      </div>

      {/* Mobile: single bottom bar with toggle + info + counter on one line */}
      <div
        className="md:hidden absolute bottom-2 inset-x-2 z-10 flex items-center justify-between gap-2 text-white text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="hover:text-neutral-300 transition-colors flex-none"
        >
          {toggleLabel}
        </button>
        {showInfo && (
          <div className="flex-1 min-w-0 flex flex-wrap items-baseline justify-center gap-x-2">
            {caption && (
              <span className="font-serif text-sm truncate max-w-full">{caption}</span>
            )}
            {dateLabel && <span className="text-neutral-300">{dateLabel}</span>}
            <span className="text-neutral-300">{mediumLabel}</span>
          </div>
        )}
        <span className="flex-none">{counterLabel}</span>
      </div>

      {/* Desktop: toggle button (bottom-left) */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setShowInfo(!showInfo)
        }}
        className="hidden md:block absolute bottom-4 left-4 text-white hover:text-neutral-300 transition-colors text-sm z-10"
      >
        {toggleLabel}
      </button>

      {/* Desktop: stacked info panel above the toggle */}
      {showInfo && (
        <div
          className="hidden md:block absolute bottom-16 left-4 max-w-md text-white text-left"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-start gap-y-1">
            {caption && <p className="font-serif text-lg">{caption}</p>}
            {dateLabel && <p className="text-sm text-neutral-300">{dateLabel}</p>}
            <p className="text-sm text-neutral-300">{mediumLabel}</p>
          </div>
          {currentImage.availableAsPrint && (
            <button className="mt-4 px-4 py-2 bg-primary text-white text-sm hover:bg-primary-dark transition-colors">
              {availableAsPrintText}
            </button>
          )}
        </div>
      )}

      {/* Desktop: image counter (bottom-right) */}
      <div className="hidden md:block absolute bottom-4 right-4 text-white text-sm z-10">
        {counterLabel}
      </div>
    </div>
  )
}
