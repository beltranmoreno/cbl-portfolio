import Link from 'next/link'
import Image from 'next/image'
import { Locale, getLocalizedString, getLocalizedSlug, getLocalizedText, formatProjectYears } from '@/lib/i18n'
import { urlForImage } from '@/lib/sanity.client'
import type { FeaturedProject } from '@/lib/types'

interface FeaturedProjectCardProps {
  project: FeaturedProject
  locale: Locale
}

export default function FeaturedProjectCard({ project, locale }: FeaturedProjectCardProps) {
  const title = getLocalizedString(project.title, locale)
  const slug = getLocalizedSlug(project.slug, locale)?.current || ''
  const description = getLocalizedText(project.description, locale)
  const location = project.locations?.[0] || ''

  return (
    <Link
      href={`/${locale}/projects/${slug}`}
      className="group"
    >
      <div className="relative overflow-hidden mb-4 w-full h-full min-h-[400px] md:min-h-[500px]">
        <Image
          src={urlForImage(project.featuredImage).width(1200).url()}
          alt={title || 'Project'}
          fill
          className="object-cover transition-transform duration-300"
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
}
