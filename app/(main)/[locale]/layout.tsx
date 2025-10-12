import { ReactNode } from 'react'
import type { Metadata } from 'next'
import FloatingNav from '@/components/FloatingNav'
import Footer from '@/components/Footer'
import ProgressBar from '@/components/ProgressBar'
import { NavigationProvider } from '@/contexts/NavigationContext'
import { Locale, locales, getTranslations } from '@/lib/i18n'
import { getSiteSettings } from '@/lib/sanity.queries'

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale: locale as Locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params

  return {
    title:
      locale === 'es'
        ? 'Carmen Ballvé - Fotografía de Retrato'
        : 'Carmen Ballvé - Portrait Photography',
    description:
      locale === 'es'
        ? 'Fotógrafa de retrato en blanco y negro especializada en proyectos documentales globales.'
        : 'Black and white portrait photographer specializing in global documentary projects.',
    alternates: {
      canonical: `https://carmenballve.com/${locale}`,
      languages: {
        en: '/en',
        es: '/es',
      },
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const translations = getTranslations(locale)
  const siteSettings = await getSiteSettings()

  return (
    <NavigationProvider>
      <ProgressBar />
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
