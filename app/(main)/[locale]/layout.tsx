import { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Inter, Crimson_Pro } from 'next/font/google'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Locale, locales, getTranslations } from '@/lib/i18n'
import { getSiteSettings } from '@/lib/sanity.queries'
import '../../globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const crimson = Crimson_Pro({
  variable: '--font-crimson',
  subsets: ['latin'],
  display: 'swap',
})

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
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
    <html lang={locale}>
      <body className={`${inter.variable} ${crimson.variable} antialiased`}>
        <Navigation locale={locale} translations={translations.navigation} />
        <main id="main-content">{children}</main>
        <Footer
          locale={locale}
          contactEmail={siteSettings?.contactEmail}
          socialLinks={siteSettings?.socialLinks}
          copyright={translations.common.copyright}
        />
      </body>
    </html>
  )
}
