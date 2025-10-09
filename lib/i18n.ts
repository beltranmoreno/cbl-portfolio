import type { Translations, LocalizedString, LocalizedSlug, LocalizedText, PortableTextBlock } from './types'
import enCommon from '@/locales/en/common.json'
import enNavigation from '@/locales/en/navigation.json'
import esCommon from '@/locales/es/common.json'
import esNavigation from '@/locales/es/navigation.json'

export const locales = ['en', 'es'] as const
export const defaultLocale = 'en' as const

export type Locale = (typeof locales)[number]

const translations = {
  en: {
    common: enCommon,
    navigation: enNavigation,
  },
  es: {
    common: esCommon,
    navigation: esNavigation,
  },
}

export function getTranslations(locale: Locale): Translations {
  return translations[locale]
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
export function getLocalizedField<T, K extends keyof T>(
  obj: T | undefined,
  field: K,
  locale: Locale
): string {
  if (!obj || !obj[field]) return ''
  const value = obj[field]
  if (typeof value === 'object' && value !== null && locale in value) {
    const localized = (value as Record<string, unknown>)[locale]
    return typeof localized === 'string' ? localized : String(localized || '')
  }
  return typeof value === 'string' ? value : String(value || '')
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
