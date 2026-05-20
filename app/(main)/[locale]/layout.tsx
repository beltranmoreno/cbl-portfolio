import { ReactNode, Suspense } from 'react'
import type { Metadata } from 'next'
import FloatingNav from '@/components/FloatingNav'
import Footer from '@/components/Footer'
import ProgressBar from '@/components/ProgressBar'
import { NavigationProvider } from '@/contexts/NavigationContext'
import { Locale, locales, getTranslations } from '@/lib/i18n'
import { getSiteSettings } from '@/lib/sanity.queries'

export const dynamicParams = false

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const l = (locale === 'es' ? 'es' : 'en') as 'en' | 'es'

  // Layout-level metadata sets the title TEMPLATE so each page's `title`
  // becomes `Page — Carmen Ballvé`, and defines the locale-aware defaults.
  return {
    title: {
      default: l === 'es'
        ? 'Carmen Ballvé — Fotografía de Retrato y Documental'
        : 'Carmen Ballvé — Portrait & Documentary Photography',
      template: '%s — Carmen Ballvé',
    },
    description:
      l === 'es'
        ? 'Carmen Ballvé es una fotógrafa documental y de retrato especializada en proyectos de película en blanco y negro en América Latina y más allá.'
        : 'Carmen Ballvé is a documentary and portrait photographer specializing in black-and-white film projects across Latin America and beyond.',
    alternates: {
      canonical: `/${l}`,
      languages: {
        en: '/en',
        es: '/es',
      },
    },
    openGraph: {
      locale: l === 'es' ? 'es_ES' : 'en_US',
      alternateLocale: l === 'es' ? ['en_US'] : ['es_ES'],
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const resolvedParams = await params
  const locale = resolvedParams.locale as Locale
  const translations = getTranslations(locale)
  const siteSettings = await getSiteSettings()

  return (
    <NavigationProvider>
      <Suspense fallback={null}>
        <ProgressBar />
      </Suspense>
      {/* <Navigation locale={locale} translations={translations.navigation} /> */}
      <FloatingNav locale={locale} translations={translations.navigation} />
      <main id="main-content">{children}</main>
      <Footer
        locale={locale}
        contactEmail={siteSettings?.contactEmail}
        socialLinks={siteSettings?.socialLinks}
        copyright={translations.common.copyright}
      />
    </NavigationProvider>
  )
}
