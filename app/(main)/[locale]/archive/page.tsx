import type { Metadata } from 'next'
import { Locale, getTranslations, getLocalizedString } from '@/lib/i18n'
import { getAllImages } from '@/lib/sanity.queries'
import { buildMetadata } from '@/lib/seo'
import ArchiveClient from './ArchiveClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const l = (locale === 'es' ? 'es' : 'en') as 'en' | 'es'
  // Use the first featured image as the social preview if we have one.
  const images = await getAllImages()
  const ogImage = images[0]?.image
  return buildMetadata({
    title: l === 'es' ? 'Archivo' : 'Archive',
    description:
      l === 'es'
        ? 'Explora el archivo completo de fotografías de Carmen Ballvé: proyectos documentales en blanco y negro de América Latina y más allá.'
        : 'Browse the complete archive of Carmen Ballvé’s photography: black-and-white documentary projects from Latin America and beyond.',
    pathEn: 'archive',
    pathEs: 'archive',
    locale: l,
    image: ogImage,
  })
}

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const resolvedParams = await params
  const locale = resolvedParams.locale as Locale
  const translations = getTranslations(locale)
  const allImages = await getAllImages()

  // Extract unique projects (location IDs used for filter cross-referencing)
  const projects = Array.from(
    new Map(
      allImages
        .filter((img) => img.project)
        .map((img) => [
          img.project._id,
          {
            _id: img.project._id,
            title: getLocalizedString(img.project.title, locale),
            locationIds: (img.project.locations || []).map((loc) => loc._id),
          },
        ])
    ).values()
  ).sort((a, b) => a.title.localeCompare(b.title))

  // Unique location filter options, deduped by Sanity _id, sorted by localized name
  const locations = Array.from(
    new Map(
      allImages
        .flatMap((img) => img.project?.locations || [])
        .map((loc) => [loc._id, { _id: loc._id, name: getLocalizedString(loc.name, locale) }])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name))

  const years = Array.from(
    new Set(
      allImages
        .map((img) => img.project?.startYear)
        .filter((y): y is number => y !== null && y !== undefined)
    )
  ).sort((a, b) => b - a)

  const tags = Array.from(
    new Set(allImages.flatMap((img) => img.tags || []).filter(Boolean))
  ).sort()

  return (
    <div className="min-h-screen">
      <div className="container py-8 md:py-12">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-neutral-900 mb-12 text-center">
          {locale === 'en' ? 'Archive' : 'Archivo'}
        </h1>

        <ArchiveClient
          locale={locale}
          images={allImages}
          projects={projects}
          locations={locations}
          years={years}
          tags={tags}
          translations={translations.common}
        />
      </div>
    </div>
  )
}
