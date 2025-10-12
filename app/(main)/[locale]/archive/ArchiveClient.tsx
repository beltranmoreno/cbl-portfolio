'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Locale, getLocalizedField, getLocalizedSlug } from '@/lib/i18n'
import type { ImageAsset, CommonTranslations } from '@/lib/types'
import MasonryGrid from '@/components/MasonryGrid'
import ImageWithBorder from '@/components/ImageWithBorder'
import { useNavigation } from '@/contexts/NavigationContext'

interface Project {
  _id: string
  title: string
  locations: string[]
}

interface ArchiveClientProps {
  locale: Locale
  images: ImageAsset[]
  projects: Project[]
  locations: string[]
  years: number[]
  tags: string[]
  translations: Pick<CommonTranslations, 'location' | 'year' | 'tags' | 'clearFilters' | 'showing' | 'noResults'>
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
  const { isNavVisible } = useNavigation()
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedYears, setSelectedYears] = useState<number[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Get locations from selected projects
  const projectLocations = useMemo(() => {
    if (selectedProjects.length === 0) return []
    return Array.from(
      new Set(
        projects
          .filter((p) => selectedProjects.includes(p._id))
          .flatMap((p) => p.locations)
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

      // Location filter (using effective locations)
      if (effectiveLocations.length > 0) {
        const hasMatchingLocation = img.project?.locations?.some((loc) =>
          effectiveLocations.includes(loc)
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
      <div
        className="sticky z-40 bg-white border-y border-neutral-200 py-4 mb-8 transition-all duration-300"
        style={{
          top: isNavVisible ? 'var(--nav-height)' : '0'
        }}
      >
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
                const isFromProject = projectLocations.includes(location)
                const isDisabled = selectedProjects.length > 0 && !isFromProject
                const isActive = effectiveLocations.includes(location)

                return (
                  <button
                    key={location}
                    onClick={() => toggleLocation(location)}
                    disabled={isDisabled}
                    className={`px-3 py-1 text-sm border transition-colors ${
                      isActive
                        ? 'bg-primary text-white border-primary'
                        : isDisabled
                        ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary'
                    }`}
                  >
                    {location}
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
        

        {/* Active Filters & Clear Button */}
        {hasActiveFilters && (
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={clearAllFilters}
              className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              {translations.clearFilters}
            </button>
            <span className="text-sm text-neutral-600">
              {translations.showing.replace(
                '{count}',
                filteredImages.length.toString()
              )}
            </span>
          </div>
        )}

        {!hasActiveFilters && (
          <div className="mt-4">
            <span className="text-sm text-neutral-600">
              {translations.showing.replace(
                '{count}',
                filteredImages.length.toString()
              )}
            </span>
          </div>
        )}
      </div>
      </div>

      {/* Masonry Grid */}
      {filteredImages.length > 0 ? (
        <MasonryGrid>
          {filteredImages.map((imageAsset) => {
            const projectTitle = getLocalizedField(
              imageAsset.project,
              'title',
              locale
            )
            const projectSlug = getLocalizedSlug(
              imageAsset.project?.slug,
              locale
            )?.current || ''
            const location = imageAsset.project?.locations?.[0] || ''

            return (
              <Link
                key={imageAsset._id}
                href={`/${locale}/projects/${projectSlug}`}
                className="mb-4 md:mb-6 block group"
              >
                <div className="relative overflow-hidden">
                  <div className="image-hover">
                    <ImageWithBorder
                      image={imageAsset.image}
                      alt={
                        getLocalizedField(imageAsset, 'caption', locale) ||
                        projectTitle ||
                        'Photography'
                      }
                      medium={imageAsset.medium}
                      filmFormat={imageAsset.filmFormat}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 md:p-6">
                    <div className="text-white">
                      <h3 className="font-serif text-lg md:text-xl font-bold mb-1">
                        {projectTitle}
                      </h3>
                      {location && (
                        <p className="text-sm text-white/90">{location}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </MasonryGrid>
      ) : (
        <div className="text-center py-20">
          <p className="text-neutral-600 text-lg">{translations.noResults}</p>
        </div>
      )}
    </>
  )
}
