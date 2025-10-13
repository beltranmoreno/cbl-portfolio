import Image from 'next/image'
import Link from 'next/link'
import { Locale, getTranslations, getLocalizedField, getLocalizedText, getLocalizedSlug, formatProjectYears, getLocalizedString } from '@/lib/i18n'
import { getSiteSettings, getAllProjects, type PortableTextBlock } from '@/lib/sanity.queries'
import { urlForImage } from '@/lib/sanity.client'

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const resolvedParams = await params
  const locale = resolvedParams.locale as Locale
  const translations = getTranslations(locale)
  const siteSettings = await getSiteSettings()
  const allProjects = await getAllProjects()

  const bio = getLocalizedText(siteSettings?.aboutBio, locale)

  // Sort projects by year for timeline
  const timelineProjects = [...allProjects].sort((a, b) => {
    return b.startYear - a.startYear
  })

  return (
    <div className="min-h-screen">
      {/* Introduction Section */}
      <section className="container py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Portrait */}
          {siteSettings?.aboutImage && (
            <div className="relative aspect-[3/4] w-full max-w-md mx-auto">
              <Image
                src={urlForImage(siteSettings.aboutImage).width(600).url()}
                alt="Carmen Ballvé"
                fill
                className="object-cover grayscale"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          )}

          {/* Bio */}
          <div className="space-y-6">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-neutral-900">
              {locale === 'en' ? 'About' : 'Acerca de'}
            </h1>

            {bio && (
              <div className="prose prose-lg max-w-none">
                {bio.map((block: PortableTextBlock, index: number) => {
                  if (block._type === 'block') {
                    return (
                      <p
                        key={index}
                        className="text-neutral-700 leading-relaxed mb-4"
                      >
                        {block.children?.map((child) => child.text).join('')}
                      </p>
                    )
                  }
                  return null
                })}
              </div>
            )}

            {/* Contact */}
            {siteSettings?.contactEmail && (
              <div className="pt-6 border-t border-neutral-200">
                <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500 mb-2">
                  {locale === 'en' ? 'Contact' : 'Contacto'}
                </h2>
                <a
                  href={`mailto:${siteSettings.contactEmail}`}
                  className="text-lg text-primary hover:text-primary-dark transition-colors"
                >
                  {siteSettings.contactEmail}
                </a>
              </div>
            )}

            {/* Social Links */}
            {siteSettings?.socialLinks && siteSettings.socialLinks.length > 0 && (
              <div className="flex gap-4">
                {siteSettings.socialLinks.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-600 hover:text-primary transition-colors"
                  >
                    {link.platform}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Exhibitions Section */}
      {siteSettings?.exhibitions && siteSettings.exhibitions.length > 0 && (
        <section className="container py-12 md:py-20 border-t border-neutral-200">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900 mb-12 text-center">
            {locale === 'en' ? 'Notable Exhibitions' : 'Exposiciones Destacadas'}
          </h2>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {siteSettings.exhibitions
                .sort((a, b) => b.year - a.year)
                .map((exhibition, index) => {
                  const title = getLocalizedString(exhibition.title, locale)
                  const venue = getLocalizedString(exhibition.venue, locale)

                  return (
                    <div
                      key={index}
                      className="border-l-4 border-primary pl-6 py-2"
                    >
                      <div className="flex flex-wrap items-baseline gap-2 mb-1">
                        <h3 className="font-serif text-xl font-bold text-neutral-900">
                          {title}
                        </h3>
                        <span className="text-primary font-bold">
                          {exhibition.year}
                        </span>
                      </div>
                      <p className="text-neutral-700">
                        {venue}
                        {exhibition.location && `, ${exhibition.location}`}
                      </p>
                      {exhibition.type && (
                        <p className="text-sm text-neutral-500 mt-1">
                          {exhibition.type === 'solo'
                            ? locale === 'en' ? 'Solo Exhibition' : 'Exposición Individual'
                            : locale === 'en' ? 'Group Exhibition' : 'Exposición Colectiva'}
                        </p>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        </section>
      )}

      {/* Awards Section */}
      {siteSettings?.awards && siteSettings.awards.length > 0 && (
        <section className="container py-12 md:py-20 border-t border-neutral-200">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900 mb-12 text-center">
            {locale === 'en' ? 'Awards & Recognitions' : 'Premios y Reconocimientos'}
          </h2>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {siteSettings.awards
                .sort((a, b) => b.year - a.year)
                .map((award, index) => {
                  const title = getLocalizedString(award.title, locale)
                  const organization = getLocalizedString(award.organization, locale)
                  const description = award.description ? getLocalizedText(award.description, locale) : null

                  return (
                    <div
                      key={index}
                      className="border-l-4 border-primary pl-6 py-2"
                    >
                      <div className="flex flex-wrap items-baseline gap-2 mb-1">
                        <h3 className="font-serif text-xl font-bold text-neutral-900">
                          {title}
                        </h3>
                        <span className="text-primary font-bold">
                          {award.year}
                        </span>
                      </div>
                      <p className="text-neutral-700 mb-2">
                        {organization}
                      </p>
                      {description && description.length > 0 && (
                        <div className="prose prose-sm max-w-none">
                          {description.map((block: PortableTextBlock, blockIndex: number) => {
                            if (block._type === 'block') {
                              return (
                                <p
                                  key={blockIndex}
                                  className="text-neutral-600 leading-relaxed"
                                >
                                  {block.children?.map((child) => child.text).join('')}
                                </p>
                              )
                            }
                            return null
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        </section>
      )}

      {/* Timeline Section */}
      <section className="container py-12 md:py-20 border-t border-neutral-200">
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900 mb-12 text-center">
          {translations.common.projectsOverTime}
        </h2>

        <div className="relative max-w-4xl mx-auto">
          {/* Timeline Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-neutral-300 hidden md:block" />

          {/* Timeline Entries */}
          <div className="space-y-12 md:space-y-16">
            {timelineProjects.map((project, index) => {
              const title = getLocalizedField(project, 'title', locale)
              const slug = getLocalizedSlug(project.slug, locale)?.current
              const isLeft = index % 2 === 0

              return (
                <div
                  key={project._id}
                  className={`relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${
                    isLeft ? '' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Year Marker */}
                  <div
                    className={`hidden md:block absolute left-1/2 -translate-x-1/2 bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center font-bold z-10`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span className="text-sm">{project.startYear}</span>
                  </div>

                  {/* Content */}
                  <div
                    className={`${
                      isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12 md:col-start-2'
                    }`}
                  >
                    <Link
                      href={`/${locale}/projects/${slug}`}
                      className="block group"
                    >
                      <div className="relative overflow-hidden mb-4">
                        <Image
                          src={urlForImage(project.featuredImage)
                            .width(600)
                            .url()}
                          alt={title || 'Project'}
                          width={600}
                          height={800}
                          className="w-full h-auto transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                      </div>
                      <h3 className="font-serif text-xl md:text-2xl font-bold text-neutral-900 mb-2 group-hover:text-primary transition-colors">
                        {title}
                      </h3>
                      {project.locations && (
                        <p className="text-neutral-600 text-sm">
                          {project.locations.join(', ')}
                        </p>
                      )}
                      {/* Mobile year display */}
                      <p className="md:hidden text-primary font-bold mt-2">
                        {formatProjectYears(project.startYear, project.endYear, project.isOngoing, locale)}
                      </p>
                    </Link>
                  </div>

                  {/* Spacer for alternating layout */}
                  {isLeft && <div className="hidden md:block" />}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
