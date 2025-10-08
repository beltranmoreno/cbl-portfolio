import { Locale, getTranslations, getLocalizedString, getLocalizedSlug, getLocalizedText, formatProjectYears } from '@/lib/i18n'
import { getFeaturedImages, getSiteSettings } from '@/lib/sanity.queries'
import HomeContent from '@/components/HomeContent'
import Link from 'next/link'
import { urlForImage } from '@/lib/sanity.client'
import Image from 'next/image'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
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
            {featuredProjects.map((project) => {
              const title = getLocalizedString(project.title, locale)
              const slug = getLocalizedSlug(project.slug, locale)?.current || ''
              const description = getLocalizedText(project.description, locale)
              const location = project.locations?.[0] || ''

              return (
                <Link
                  key={project._id}
                  href={`/${locale}/projects/${slug}`}
                  className="group"
                >
                  <div className="relative overflow-hidden mb-4 aspect-[4/3]">
                    <Image
                      src={urlForImage(project.featuredImage).width(800).url()}
                      alt={title || 'Project'}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <h3 className="font-serif text-2xl md:text-3xl font-bold text-neutral-900 mb-2 group-hover:text-primary transition-colors">
                    {title}
                  </h3>
                  <p className="text-sm text-neutral-600 uppercase tracking-wide mb-2">
                    {location} • {formatProjectYears(project.startYear, project.endYear, project.isOngoing, locale)}
                  </p>
                  {description && description[0] && (
                    <p className="text-neutral-700 line-clamp-2">
                      {description[0].children?.[0]?.text || ''}
                    </p>
                  )}
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="container py-12 md:py-16 text-center">
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
