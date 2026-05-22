'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { urlForImage, getImageMeta } from '@/lib/sanity.client'
import type { ImageAsset } from '@/lib/sanity.queries'
import { Locale, getLocalizedField, getLocalizedString, getLocalizedSlug, formatImageDate } from '@/lib/i18n'

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

  // Project link (only present when the image was queried with project info)
  const projectTitle = currentImage.project
    ? getLocalizedString(currentImage.project.title, locale)
    : ''
  const projectSlug = currentImage.project
    ? getLocalizedSlug(currentImage.project.slug, locale)?.current || ''
    : ''
  const projectHref = projectSlug ? `/${locale}/projects/${projectSlug}` : null

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
        className="absolute -left-1 md:left-1 top-1/2 -translate-y-1/2 text-white hover:text-neutral-300 transition-colors p-1 md:p-4 z-10"
        aria-label="Previous image"
      >
        <svg
          className="w-7 h-7 md:w-12 md:h-12"
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
        className="absolute -right-1 md:right-1 top-1/2 -translate-y-1/2 text-white hover:text-neutral-300 transition-colors p-1 md:p-4 z-10"
        aria-label="Next image"
      >
        <svg
          className="w-7 h-7 md:w-12 md:h-12"
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
        {(() => {
          const meta = getImageMeta(currentImage.image)
          const w = meta.dimensions?.width ?? 1920
          const h = meta.dimensions?.height ?? 1080
          return (
            <Image
              key={index}
              src={urlForImage(currentImage.image).width(1920).url()}
              alt={caption as string || 'Photography'}
              width={w}
              height={h}
              sizes="100vw"
              className={`max-w-full max-h-full object-contain transition-[filter] duration-500 ${
                isLoading ? 'blur-lg' : 'blur-0'
              }`}
              priority
              placeholder={meta.lqip ? 'blur' : 'empty'}
              blurDataURL={meta.lqip}
              onLoad={() => setIsLoading(false)}
            />
          )
        })()}
      </div>

      {/* Unified bottom bar (mobile + desktop): toggle on the left, info
          centered, counter on the right. Print CTA, if applicable, sits
          centered below the info line on desktop only. */}
      <div
        className="absolute bottom-2 md:bottom-4 inset-x-2 md:inset-x-6 z-10 flex items-center justify-between gap-2 text-white text-xs md:text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="hover:text-neutral-300 transition-colors flex-none"
        >
          {toggleLabel}
        </button>
        {showInfo && (() => {
          // Each part renders as a span (or Link for project). Bullets are
          // inserted between consecutive parts so they always separate caption
          // • date • medium • project, regardless of which ones are present.
          const parts: { key: string; node: React.ReactNode }[] = []
          if (caption) {
            parts.push({
              key: 'caption',
              node: (
                <span className="font-serif text-sm md:text-base truncate max-w-full">
                  {caption}
                </span>
              ),
            })
          }
          if (dateLabel) {
            parts.push({
              key: 'date',
              node: <span className="text-neutral-300">{dateLabel}</span>,
            })
          }
          parts.push({
            key: 'medium',
            node: <span className="text-neutral-300">{mediumLabel}</span>,
          })
          if (projectTitle && projectHref) {
            parts.push({
              key: 'project',
              node: (
                <Link
                  href={projectHref}
                  onClick={onClose}
                  className="text-white underline underline-offset-2 md:underline-offset-4 decoration-white/40 hover:decoration-white inline-flex items-center gap-1"
                >
                  {projectTitle}
                  <span aria-hidden="true" className="hidden md:inline">→</span>
                </Link>
              ),
            })
          }
          return (
            <div className="flex-1 min-w-0 flex flex-col items-center gap-y-2">
              <div className="flex flex-wrap items-baseline justify-center gap-x-2 md:gap-x-3">
                {parts.map((p, i) => (
                  <span key={p.key} className="flex items-baseline gap-x-2 md:gap-x-3">
                    {i > 0 && <span aria-hidden="true" className="text-neutral-400">•</span>}
                    {p.node}
                  </span>
                ))}
              </div>
              {currentImage.availableAsPrint && (
                <Link
                  href={projectHref || '#'}
                  onClick={onClose}
                  className="hidden md:inline-block px-4 py-2 bg-primary text-white text-sm hover:bg-primary-dark transition-colors"
                >
                  {availableAsPrintText}
                </Link>
              )}
            </div>
          )
        })()}
        <span className="flex-none">{counterLabel}</span>
      </div>
    </div>
  )
}
