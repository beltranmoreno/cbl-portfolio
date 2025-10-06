import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Locale, getTranslations, getLocalizedField, formatProjectYears } from '@/lib/i18n'
import { getProjectBySlug, getAllProjects } from '@/lib/sanity.queries'
import { urlForImage } from '@/lib/sanity.client'
import ProjectGallery from './ProjectGallery'

export async function generateStaticParams() {
  const projects = await getAllProjects('en')

  const params = []
  for (const project of projects) {
    params.push(
      { locale: 'en', slug: project.slug.en.current },
      { locale: 'es', slug: project.slug.es.current }
    )
  }

  return params
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params
  const translations = getTranslations(locale)
  const project = await getProjectBySlug(slug, locale)

  if (!project) {
    notFound()
  }

  const title = getLocalizedField(project, 'title', locale)
  const description = getLocalizedField(project, 'description', locale)
  const publications = getLocalizedField(project, 'publications', locale)

  // Get next project (for "Next Project" link)
  const allProjects = await getAllProjects(locale)
  const currentIndex = allProjects.findIndex((p) => p._id === project._id)
  const nextProject =
    currentIndex < allProjects.length - 1
      ? allProjects[currentIndex + 1]
      : allProjects[0]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] md:h-[80vh]">
        <Image
          src={urlForImage(project.featuredImage).width(1920).url()}
          alt={title || 'Project'}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />

        {/* Metadata Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 md:p-12">
          <div className="container">
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-4">
              {title}
            </h1>
            <div className="flex flex-wrap gap-4 text-white/90 text-sm md:text-base mb-4">
              <span>{formatProjectYears(project.startYear, project.endYear, project.isOngoing, locale)}</span>
              {project.locations && project.locations.length > 0 && (
                <>
                  <span>•</span>
                  <span>{project.locations.join(', ')}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Project Info */}
      <section className="container py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Description */}
          {description && (
            <div className="prose prose-lg max-w-none mb-8">
              {description.map((block, index) => {
                if (block._type === 'block') {
                  return (
                    <p key={index} className="text-neutral-700 leading-relaxed">
                      {block.children.map((child) => child.text).join('')}
                    </p>
                  )
                }
                return null
              })}
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-t border-neutral-200">
            {project.primaryMedium && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-500 mb-2">
                  {locale === 'en' ? 'Medium' : 'Medio'}
                </h3>
                <p className="text-neutral-900">
                  {project.primaryMedium === 'film-bw'
                    ? locale === 'en'
                      ? 'Film - Black & White'
                      : 'Película - Blanco y Negro'
                    : project.primaryMedium === 'digital-bw'
                    ? locale === 'en'
                      ? 'Digital - Black & White'
                      : 'Digital - Blanco y Negro'
                    : locale === 'en'
                    ? 'Mixed Media'
                    : 'Medios Mixtos'}
                </p>
              </div>
            )}

            {project.images && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-500 mb-2">
                  {locale === 'en' ? 'Images' : 'Imágenes'}
                </h3>
                <p className="text-neutral-900">
                  {project.images.length}{' '}
                  {locale === 'en' ? 'photographs' : 'fotografías'}
                </p>
              </div>
            )}

            {project.collaborators && project.collaborators.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-500 mb-2">
                  {locale === 'en' ? 'Collaborators' : 'Colaboradores'}
                </h3>
                <p className="text-neutral-900">
                  {project.collaborators.join(', ')}
                </p>
              </div>
            )}

            {publications && publications.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-500 mb-2">
                  {locale === 'en' ? 'Publications' : 'Publicaciones'}
                </h3>
                <ul className="text-neutral-900">
                  {publications.map((pub: string, index: number) => (
                    <li key={index}>{pub}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Image Gallery */}
      <section className="container py-12">
        <ProjectGallery
          images={project.images}
          locale={locale}
          availableAsPrintText={translations.common.availableAsPrint}
        />
      </section>

      {/* Next Project */}
      <section className="container py-12 md:py-16 border-t border-neutral-200">
        <div className="text-center mb-8">
          <Link
            href={`/${locale}/archive`}
            className="text-neutral-600 hover:text-primary transition-colors"
          >
            ← {translations.common.backToArchive}
          </Link>
        </div>

        {nextProject && (
          <div className="max-w-2xl mx-auto">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-neutral-900 mb-6 text-center">
              {translations.common.nextProject}
            </h2>
            <Link
              href={`/${locale}/projects/${
                getLocalizedField(nextProject, 'slug', locale)?.current
              }`}
              className="block group"
            >
              <div className="relative aspect-[4/3] overflow-hidden mb-4">
                <Image
                  src={urlForImage(nextProject.featuredImage).width(800).url()}
                  alt={getLocalizedField(nextProject, 'title', locale) || ''}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
              <h3 className="font-serif text-xl md:text-2xl font-bold text-neutral-900 text-center group-hover:text-primary transition-colors">
                {getLocalizedField(nextProject, 'title', locale)}
              </h3>
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
