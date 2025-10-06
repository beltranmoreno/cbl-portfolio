'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Locale } from '@/lib/i18n'

interface LanguageToggleProps {
  currentLocale: Locale
}

export default function LanguageToggle({ currentLocale }: LanguageToggleProps) {
  const pathname = usePathname()
  const router = useRouter()

  const switchLocale = (newLocale: Locale) => {
    if (newLocale === currentLocale) return

    // Replace the current locale in the pathname
    const newPathname = pathname.replace(`/${currentLocale}`, `/${newLocale}`)
    router.push(newPathname)
  }

  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <button
        onClick={() => switchLocale('en')}
        className={`px-2 py-1 transition-colors ${
          currentLocale === 'en'
            ? 'text-primary font-bold'
            : 'text-neutral-500 hover:text-primary'
        }`}
        aria-label="Switch to English"
        aria-current={currentLocale === 'en' ? 'true' : 'false'}
      >
        EN
      </button>
      <span className="text-neutral-300">/</span>
      <button
        onClick={() => switchLocale('es')}
        className={`px-2 py-1 transition-colors ${
          currentLocale === 'es'
            ? 'text-primary font-bold'
            : 'text-neutral-500 hover:text-primary'
        }`}
        aria-label="Switch to Spanish"
        aria-current={currentLocale === 'es' ? 'true' : 'false'}
      >
        ES
      </button>
    </div>
  )
}
