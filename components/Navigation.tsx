'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Locale } from '@/lib/i18n'
import LanguageToggle from './LanguageToggle'

interface NavigationProps {
  locale: Locale
  translations: {
    about: string
    archive: string
    shop: string
    home: string
  }
}

export default function Navigation({ locale, translations }: NavigationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false)
      } else {
        // Scrolling up
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const navLinks = [
    { href: `/${locale}/about`, label: translations.about },
    { href: `/${locale}/archive`, label: translations.archive },
    { href: `/${locale}/shop`, label: translations.shop },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-200 nav-transition ${
          isVisible ? 'nav-visible' : 'nav-hidden'
        }`}
        style={{ height: 'var(--nav-height)' }}
      >
        <div className="container h-full flex items-center justify-between">
          {/* Logo/Wordmark */}
          <Link
            href={`/${locale}`}
            className="font-serif text-2xl font-bold text-neutral-900 hover:text-primary transition-colors"
          >
            Carmen Ballvé
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-sans text-sm font-medium tracking-wide transition-colors relative ${
                  isActive(link.href)
                    ? 'text-primary'
                    : 'text-neutral-700 hover:text-primary'
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary" />
                )}
              </Link>
            ))}
            <LanguageToggle currentLocale={locale} />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-neutral-700 hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-neutral-200 shadow-lg">
            <div className="container py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-sans text-base font-medium py-2 transition-colors ${
                    isActive(link.href)
                      ? 'text-primary'
                      : 'text-neutral-700 hover:text-primary'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-neutral-200">
                <LanguageToggle currentLocale={locale} />
              </div>
            </div>
          </div>
        )}
      </nav>
      {/* Spacer to prevent content from being hidden under fixed nav */}
      <div style={{ height: 'var(--nav-height)' }} />
    </>
  )
}
