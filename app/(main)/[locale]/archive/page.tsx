import { Locale, getTranslations } from '@/lib/i18n'
import { getAllImages } from '@/lib/sanity.queries'
import ArchiveClient from './ArchiveClient'

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const translations = getTranslations(locale)
  const allImages = await getAllImages()

  // Extract unique locations and years for filters
  const locations = Array.from(
    new Set(
      allImages
        .flatMap((img) => img.project?.locations || [])
        .filter(Boolean)
    )
  ).sort()

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
          locations={locations}
          years={years}
          tags={tags}
          translations={translations.common}
        />
      </div>
    </div>
  )
}
