import type { Translations, LocalizedString, LocalizedSlug, LocalizedText, PortableTextBlock } from './types'

export const locales = ['en', 'es'] as const
export const defaultLocale = 'en' as const

export type Locale = (typeof locales)[number]

export function getTranslations(locale: Locale): Translations {
  return {
    common: require(`@/locales/${locale}/common.json`),
    navigation: require(`@/locales/${locale}/navigation.json`),
  }
}

/**
 * Get a localized string field from an object
 */
export function getLocalizedString(
  value: LocalizedString | undefined,
  locale: Locale
): string {
  if (!value) return ''
  return value[locale] || ''
}

/**
 * Get a localized slug field from an object
 */
export function getLocalizedSlug(
  value: LocalizedSlug | undefined,
  locale: Locale
): { current: string } | null {
  if (!value) return null
  return value[locale] || null
}

/**
 * Get a localized text (Portable Text) field from an object
 */
export function getLocalizedText(
  value: LocalizedText | undefined,
  locale: Locale
): PortableTextBlock[] {
  if (!value) return []
  return value[locale] || []
}

/**
 * Generic localized field getter - tries to get the locale-specific value
 * Use the specific functions above for better type safety
 */
export function getLocalizedField<T>(
  obj: T | undefined,
  field: keyof T,
  locale: Locale
): any {
  if (!obj || !obj[field]) return null
  const value = obj[field]
  if (typeof value === 'object' && value !== null && locale in value) {
    return (value as any)[locale]
  }
  return value
}

export function formatProjectYears(
  startYear: number,
  endYear?: number,
  isOngoing?: boolean,
  locale: Locale = 'en'
): string {
  if (!startYear) return ''

  if (isOngoing) {
    const presentText = locale === 'es' ? 'Presente' : 'Present'
    return `${startYear} - ${presentText}`
  }

  if (endYear && endYear !== startYear) {
    return `${startYear} - ${endYear}`
  }

  return startYear.toString()
}
