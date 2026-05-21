import type { Metadata } from 'next'
import { Locale, getTranslations, getLocalizedText } from '@/lib/i18n'
import { getFeaturedImages, getSiteSettings } from '@/lib/sanity.queries'
import { buildMetadata, extractPortableTextSummary, SITE_NAME } from '@/lib/seo'
import HomeContent from '@/components/HomeContent'
import FeaturedProjectCard from '@/components/FeaturedProjectCard'
import Link from 'next/link'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const l = (locale === 'es' ? 'es' : 'en') as 'en' | 'es'
  const [siteSettings, featuredImages] = await Promise.all([
    getSiteSettings(),
    getFeaturedImages(),
  ])
  const bio = getLocalizedText(siteSettings?.aboutBio, l)
  const description = extractPortableTextSummary(bio) || undefined
  // The first featured image stands in as the social preview.
  const ogImage = featuredImages[0]?.image
  return buildMetadata({
    description,
    pathEn: '',
    pathEs: '',
    locale: l,
    image: ogImage,
  })
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const resolvedParams = await params
  const locale = resolvedParams.locale as Locale
  const translations = getTranslations(locale)
  const featuredImages = await getFeaturedImages()
  const siteSettings = await getSiteSettings()

  const featuredProjects = siteSettings?.featuredProjects || []
  const bio = getLocalizedText(siteSettings?.aboutBio, locale)
  const bioSummary = extractPortableTextSummary(bio, 360)
  const displayName = siteSettings?.siteName || SITE_NAME

  return (
    <div className="min-h-screen">
      {/* Hero Masonry Grid with Spotlight */}
      <HomeContent
        featuredImages={featuredImages}
        locale={locale}
        availableAsPrintText={translations.common.availableAsPrint}
      />

      {/* About summary */}
      <section className="container py-16 md:py-24 text-center bg-transparent">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500 mb-3">
            {translations.common.photographer}
          </p>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-neutral-900 mb-6">
            {displayName}
          </h2>
          {bioSummary && (
            <p className="text-neutral-700 text-base md:text-lg leading-relaxed mb-8">
              {bioSummary}
            </p>
          )}
          <div className="mt-4 flex justify-center gap-4">
          <Link
            href={`/${locale}/archive`}
            className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary-dark transition-colors border-b border-current pb-0.5"
          >
            {translations.common.viewFullArchive}
            <span aria-hidden="true">→</span>
          </Link>
          <Link
            href={`/${locale}/about`}
            className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary-dark transition-colors border-b border-current pb-0.5"
          >
            {translations.common.moreAboutCarmen}
            <span aria-hidden="true">→</span>
          </Link>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="container py-12 md:py-20">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900 mb-8 md:mb-12 text-center">
            {translations.common.featuredWork}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {featuredProjects.map((project) => (
              <FeaturedProjectCard
                key={project._id}
                project={project}
                locale={locale}
              />
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="container py-4 text-center mt-2">
        <Link
          href={`/${locale}/archive`}
          className="inline-block px-8 py-4 bg-primary text-white font-sans font-medium text-lg hover:bg-primary-dark transition-colors"
        >
          {translations.common.viewFullArchive}
        </Link>
      </section>
    </div>
  )
}
