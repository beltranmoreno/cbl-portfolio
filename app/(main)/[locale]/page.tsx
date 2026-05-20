import type { Metadata } from 'next'
import { Locale, getTranslations, getLocalizedText } from '@/lib/i18n'
import { getFeaturedImages, getSiteSettings } from '@/lib/sanity.queries'
import { buildMetadata, extractPortableTextSummary } from '@/lib/seo'
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

  return (
    <div className="min-h-screen">
      {/* Hero Masonry Grid with Spotlight */}
      <HomeContent
        featuredImages={featuredImages}
        locale={locale}
      />

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
      <section className="container py-12 md:py-16 text-center mt-12">
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
