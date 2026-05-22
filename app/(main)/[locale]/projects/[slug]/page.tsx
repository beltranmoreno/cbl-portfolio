import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Locale, getTranslations, getLocalizedString, getLocalizedText, getLocalizedSlug, formatProjectYears } from '@/lib/i18n'
import { getProjectBySlug, getAllProjects, type PortableTextBlock, type Project, type ImageAsset } from '@/lib/sanity.queries'
import { buildMetadata, extractPortableTextSummary } from '@/lib/seo'
import { urlForImage } from '@/lib/sanity.client'
import ProjectGallery from './ProjectGallery'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const l = (locale === 'es' ? 'es' : 'en') as 'en' | 'es'
  const project = await getProjectBySlug(slug, l)
  if (!project) {
    return buildMetadata({
      title: l === 'es' ? 'Proyecto no encontrado' : 'Project Not Found',
      pathEn: 'projects/' + slug,
      pathEs: 'projects/' + slug,
      locale: l,
      noIndex: true,
    })
  }
  const title = getLocalizedString(project.title, l)
  const description =
    extractPortableTextSummary(getLocalizedText(project.description, l)) ||
    undefined
  const slugEn = project.slug?.en?.current || slug
  const slugEs = project.slug?.es?.current || slug
  return buildMetadata({
    title,
    description,
    pathEn: `projects/${slugEn}`,
    pathEs: `projects/${slugEs}`,
    locale: l,
    image: project.featuredImage,
    ogType: 'article',
  })
}

// Extended Project type with images
type ProjectWithImages = Project & {
  images?: ImageAsset[]
}

export const dynamicParams = false

export async function generateStaticParams() {
  const projects = await getAllProjects()

  const params = []
  for (const project of projects) {
    if (project.slug?.en?.current && project.slug?.es?.current) {
      params.push(
        { locale: 'en' as Locale, slug: project.slug.en.current },
        { locale: 'es' as Locale, slug: project.slug.es.current }
      )
    }
  }

  return params
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const resolvedParams = await params
  const locale = resolvedParams.locale as Locale
  const slug = resolvedParams.slug
  const translations = getTranslations(locale)
  const projectData = await getProjectBySlug(slug, locale)

  if (!projectData) {
    notFound()
  }

  const project = projectData as ProjectWithImages

  const title = getLocalizedString(project.title, locale)
  const description = getLocalizedText(project.description, locale)
  const publications = Array.isArray(project.publications)
    ? project.publications.map(pub => getLocalizedString(pub, locale))
    : []

  // Get next project (wraps to the first), but skip if it would be the current one.
  const allProjects = await getAllProjects()
  const currentIndex = allProjects.findIndex((p) => p._id === project._id)
  const candidate =
    currentIndex >= 0
      ? allProjects[(currentIndex + 1) % allProjects.length]
      : null
  const nextProject =
    candidate && candidate._id !== project._id ? candidate : null

  return (
    <div className="min-h-screen">
      {/* Hero: image + title/meta/description side by side */}
      <section className="container pt-8 md:pt-24 pb-10 md:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
          {/* Cover image */}
          <div className="md:col-span-7 relative aspect-[3/2] overflow-hidden">
            <Image
              src={urlForImage(project.featuredImage).width(1400).url()}
              alt={title || 'Project'}
              fill
              priority
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 58vw"
            />
          </div>

          {/* Title + metadata + description */}
          <div className="md:col-span-5">
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-neutral-900 leading-tight mb-3">
              {title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-neutral-600 text-sm md:text-base mb-6">
              <span>{formatProjectYears(project.startYear, project.endYear, project.isOngoing, locale)}</span>
              {project.locations && project.locations.length > 0 && (
                <>
                  <span aria-hidden="true">•</span>
                  <span>
                    {project.locations
                      .map((loc) => getLocalizedString(loc.name, locale))
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </>
              )}
            </div>
            {description && description.length > 0 && (
              <div className="prose max-w-none">
                {description.map((block: PortableTextBlock, index: number) => {
                  if (block._type === 'block') {
                    return (
                      <p key={index} className="text-neutral-700 leading-relaxed">
                        {block.children?.map((child) => child.text).join('')}
                      </p>
                    )
                  }
                  return null
                })}
              </div>
            )}

            {/* Metadata stack — under the description */}
            <dl className="mt-8 pt-6 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              {project.primaryMedium && (
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-neutral-500 mb-1">
                    {locale === 'en' ? 'Medium' : 'Medio'}
                  </dt>
                  <dd className="text-neutral-900">
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
                  </dd>
                </div>
              )}

              {project.images && (
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-neutral-500 mb-1">
                    {locale === 'en' ? 'Images' : 'Imágenes'}
                  </dt>
                  <dd className="text-neutral-900">
                    {project.images.length}{' '}
                    {locale === 'en' ? 'photographs' : 'fotografías'}
                  </dd>
                </div>
              )}

              {project.collaborators && project.collaborators.length > 0 && (
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-neutral-500 mb-1">
                    {locale === 'en' ? 'Collaborators' : 'Colaboradores'}
                  </dt>
                  <dd className="text-neutral-900">
                    {project.collaborators.join(', ')}
                  </dd>
                </div>
              )}

              {publications && publications.length > 0 && (
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-neutral-500 mb-1">
                    {locale === 'en' ? 'Publications' : 'Publicaciones'}
                  </dt>
                  <dd className="text-neutral-900">
                    <ul>
                      {publications.map((pub: string, index: number) => (
                        <li key={index}>{pub}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </section>

      {/* Image Gallery */}
      {project.images && project.images.length > 0 && (
        <section className="container py-12">
          <ProjectGallery
            images={project.images}
            locale={locale}
            availableAsPrintText={translations.common.availableAsPrint}
          />
        </section>
      )}

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
                getLocalizedSlug(nextProject.slug, locale)?.current || ''
              }`}
              className="block group"
            >
              <div className="relative aspect-[3/2] overflow-hidden mb-4">
                <Image
                  src={urlForImage(nextProject.featuredImage).width(800).url()}
                  alt={getLocalizedString(nextProject.title, locale)}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
              <h3 className="font-serif text-xl md:text-2xl font-bold text-neutral-900 text-center group-hover:text-primary transition-colors">
                {getLocalizedString(nextProject.title, locale)}
              </h3>
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
