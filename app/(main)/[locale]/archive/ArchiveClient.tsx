'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Locale, getLocalizedField, getLocalizedString, getLocalizedSlug } from '@/lib/i18n'
import type { ImageAsset, CommonTranslations } from '@/lib/types'
import MasonryGrid from '@/components/MasonryGrid'
import ImageWithBorder from '@/components/ImageWithBorder'
import Lightbox from '@/components/Lightbox'

interface Project {
  _id: string
  title: string
  locationIds: string[]
}

interface LocationOption {
  _id: string
  name: string
}

interface ArchiveClientProps {
  locale: Locale
  images: ImageAsset[]
  projects: Project[]
  locations: LocationOption[]
  years: number[]
  tags: string[]
  translations: Pick<CommonTranslations, 'location' | 'year' | 'tags' | 'clearFilters' | 'showing' | 'noResults' | 'availableAsPrint'>
}

export default function ArchiveClient({
  locale,
  images,
  projects,
  locations,
  years,
  tags,
  translations,
}: ArchiveClientProps) {
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedYears, setSelectedYears] = useState<number[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Get location IDs from selected projects
  const projectLocations = useMemo(() => {
    if (selectedProjects.length === 0) return []
    return Array.from(
      new Set(
        projects
          .filter((p) => selectedProjects.includes(p._id))
          .flatMap((p) => p.locationIds)
      )
    )
  }, [selectedProjects, projects])

  // Auto-select project locations when project is selected
  const effectiveLocations = useMemo(() => {
    if (selectedProjects.length > 0) {
      return projectLocations
    }
    return selectedLocations
  }, [selectedProjects, projectLocations, selectedLocations])

  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      // Project filter
      if (selectedProjects.length > 0) {
        if (!img.project || !selectedProjects.includes(img.project._id)) {
          return false
        }
      }

      // Location filter (using effective locations — matched on location _id)
      if (effectiveLocations.length > 0) {
        const hasMatchingLocation = img.project?.locations?.some((loc) =>
          effectiveLocations.includes(loc._id)
        )
        if (!hasMatchingLocation) return false
      }

      // Year filter
      if (selectedYears.length > 0) {
        const startYear = img.project?.startYear
        if (!startYear) return false
        if (!selectedYears.includes(startYear)) return false
      }

      // Tags filter
      if (selectedTags.length > 0) {
        const hasMatchingTag = img.tags?.some((tag) =>
          selectedTags.includes(tag)
        )
        if (!hasMatchingTag) return false
      }

      return true
    })
  }, [images, selectedProjects, effectiveLocations, selectedYears, selectedTags])

  const toggleProject = (projectId: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    )
  }

  const toggleLocation = (location: string) => {
    // Don't allow manual location selection if project is selected
    if (selectedProjects.length > 0) return

    setSelectedLocations((prev) =>
      prev.includes(location)
        ? prev.filter((l) => l !== location)
        : [...prev, location]
    )
  }

  const toggleYear = (year: number) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    )
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const clearAllFilters = () => {
    setSelectedProjects([])
    setSelectedLocations([])
    setSelectedYears([])
    setSelectedTags([])
  }

  const hasActiveFilters =
    selectedProjects.length > 0 ||
    selectedLocations.length > 0 ||
    selectedYears.length > 0 ||
    selectedTags.length > 0

  return (
    <>
      {/* Filter Bar */}
      <div className="bg-white border-y border-neutral-200 py-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Project Filter */}
          <div className="flex-1">
            <label className="block text-sm font-bold uppercase tracking-wide text-neutral-700 mb-2">
              {locale === 'en' ? 'Project' : 'Proyecto'}
            </label>
            <div className="flex flex-wrap gap-2">
              {projects.map((project) => (
                <button
                  key={project._id}
                  onClick={() => toggleProject(project._id)}
                  className={`px-3 py-1 text-sm border transition-colors ${
                    selectedProjects.includes(project._id)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary'
                  }`}
                >
                  {project.title}
                </button>
              ))}
            </div>
          </div>

          {/* Location Filter */}
          <div className="flex-1">
            <label className="block text-sm font-bold uppercase tracking-wide text-neutral-700 mb-2">
              {translations.location}
            </label>
            <div className="flex flex-wrap gap-2">
              {locations.map((location) => {
                const isFromProject = projectLocations.includes(location._id)
                const isDisabled = selectedProjects.length > 0 && !isFromProject
                const isActive = effectiveLocations.includes(location._id)

                return (
                  <button
                    key={location._id}
                    onClick={() => toggleLocation(location._id)}
                    disabled={isDisabled}
                    className={`px-3 py-1 text-sm border transition-colors ${
                      isActive
                        ? 'bg-primary text-white border-primary'
                        : isDisabled
                        ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary'
                    }`}
                  >
                    {location.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Year Filter */}
          <div className="flex-1">
            <label className="block text-sm font-bold uppercase tracking-wide text-neutral-700 mb-2">
              {translations.year}
            </label>
            <div className="flex flex-wrap gap-2">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => toggleYear(year)}
                  className={`px-3 py-1 text-sm border transition-colors ${
                    selectedYears.includes(year)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          {tags.length > 0 && (
            <div className="flex-1">
              <label className="block text-sm font-bold uppercase tracking-wide text-neutral-700 mb-2">
                {translations.tags}
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 text-sm border transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Filters & Clear Button */}
        <div className="mt-4 flex items-center gap-4">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              {translations.clearFilters}
            </button>
          )}
          <span className="text-sm text-neutral-600">
            {translations.showing.replace(
              '{count}',
              filteredImages.length.toString()
            )}
          </span>
        </div>
      </div>

      {/* Masonry Grid */}
      {filteredImages.length > 0 ? (
        <MasonryGrid>
          {filteredImages.map((imageAsset, index) => {
            const projectTitle = imageAsset.project
              ? getLocalizedString(imageAsset.project.title, locale)
              : ''
            const projectSlug = imageAsset.project
              ? getLocalizedSlug(imageAsset.project.slug, locale)?.current || ''
              : ''
            const projectHref = projectSlug
              ? `/${locale}/projects/${projectSlug}`
              : null
            const firstLoc = imageAsset.project?.locations?.[0]
            const location = firstLoc ? getLocalizedString(firstLoc.name, locale) : ''
            const captionText = getLocalizedField(imageAsset, 'caption', locale)
            // Year of the image (from its own date), if available.
            const imageYear = imageAsset.date?.slice(0, 4) || ''
            // Title is the caption; if missing fall back to project title.
            const heading = captionText || projectTitle
            // Subtitle parts under the heading: project (only if heading is
            // the caption, otherwise project is already the heading) • location • year.
            // Each entry carries an optional href so the project part is rendered
            // as a Link.
            const subtitleParts: { text: string; href?: string | null }[] = [
              captionText ? { text: projectTitle, href: projectHref } : { text: '' },
              { text: location },
              { text: imageYear },
            ].filter((p) => Boolean(p.text))

            return (
              <div
                key={imageAsset._id}
                role="button"
                tabIndex={0}
                onClick={() => setLightboxIndex(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setLightboxIndex(index)
                  }
                }}
                className="mb-4 md:mb-6 block w-full text-left group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={
                  captionText
                    ? `${captionText} — ${projectTitle}`
                    : projectTitle || 'Photograph'
                }
              >
                <div className="relative overflow-hidden">
                  <div className="image-hover">
                    <ImageWithBorder
                      image={imageAsset.image}
                      alt={captionText || projectTitle || 'Photography'}
                      medium={imageAsset.medium}
                      filmFormat={imageAsset.filmFormat}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>

                  {/* Hover Overlay — gradient at the bottom only. No
                      pointer-events-none here so the project Link inside can
                      be clicked; clicks elsewhere bubble up and open the
                      lightbox. */}
                  <div className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/85 via-black/55 to-transparent pt-16 pb-4 px-4 md:pt-24 md:pb-6 md:px-6">
                    <div className="text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                      <h3 className="font-serif text-lg md:text-xl font-bold mb-1">
                        {heading}
                      </h3>
                      {subtitleParts.length > 0 && (
                        <p className="text-sm text-white/90 flex flex-wrap items-center gap-x-2">
                          {subtitleParts.map((part, i) => (
                            <span key={i} className="flex items-center gap-x-2">
                              {i > 0 && <span aria-hidden="true">•</span>}
                              {part.href ? (
                                <Link
                                  href={part.href}
                                  onClick={(e) => e.stopPropagation()}
                                  className="underline underline-offset-2 decoration-white/40 hover:decoration-white"
                                >
                                  {part.text}
                                </Link>
                              ) : (
                                <span>{part.text}</span>
                              )}
                            </span>
                          ))}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </MasonryGrid>
      ) : (
        <div className="text-center py-20">
          <p className="text-neutral-600 text-lg">{translations.noResults}</p>
        </div>
      )}

      {/* Lightbox — opens when an image is clicked */}
      {lightboxIndex !== null && (
        <Lightbox
          images={filteredImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          locale={locale}
          availableAsPrintText={translations.availableAsPrint}
        />
      )}
    </>
  )
}
