import Image from 'next/image'
import Link from 'next/link'
import { Locale, getTranslations, getLocalizedField, getLocalizedText, getLocalizedSlug, formatProjectYears } from '@/lib/i18n'
import { getSiteSettings, getAllProjects, type PortableTextBlock } from '@/lib/sanity.queries'
import { urlForImage } from '@/lib/sanity.client'

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
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
                      <div className="relative aspect-square overflow-hidden mb-4">
                        <Image
                          src={urlForImage(project.featuredImage)
                            .width(400)
                            .height(400)
                            .url()}
                          alt={title || 'Project'}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
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
