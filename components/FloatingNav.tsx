'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Locale } from '@/lib/i18n'
import LanguageToggle from './LanguageToggle'

interface FloatingNavProps {
  locale: Locale
  translations: {
    about: string
    archive: string
    shop: string
    home: string
  }
}

export default function FloatingNav({ locale, translations }: FloatingNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { href: `/${locale}`, label: translations.home, },
    { href: `/${locale}/about`, label: translations.about, },
    { href: `/${locale}/archive`, label: translations.archive, },
    { href: `/${locale}/shop`, label: translations.shop, },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* FAB Button */}
      <motion.div
        className="fixed top-4 left-4 md:top-6 md:left-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white shadow-lg flex items-center justify-center border border-neutral-200 hover:shadow-xl transition-shadow"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle menu"
        >
          <motion.div
            animate={{ rotate: isOpen ? 360 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src="/ARBOL_DE_LA_DICHA.png"
              alt=""
              width={32}
              height={32}
              className="w-6 h-6 md:w-8 md:h-8 object-contain"
            />
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Navigation Pill */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Horizontal Pill Menu */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ originX: 0 }}
              className="fixed top-4 left-4 md:top-6 md:left-6 h-12 md:h-16 bg-white shadow-lg rounded-full z-40 overflow-hidden"
            >
              <div className="flex items-center h-full pl-12 md:pl-16 pr-2 md:pr-4 gap-0.5 md:gap-3">
                {/* Navigation Links */}
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ delay: index * 0.05 + 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center px-2 md:px-4 py-1 md:py-2 rounded-full transition-all ${
                        isActive(link.href)
                          ? 'bg-primary text-white'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                      title={link.label}
                    >
                      <span className="font-sans text-xs md:text-sm font-medium whitespace-nowrap">
                        {link.label}
                      </span>
                    </Link>
                  </motion.div>
                ))}

                {/* Divider */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.3 }}
                  className="w-px h-6 md:h-8 bg-neutral-200 mx-1 md:mx-0"
                />

                {/* Language Toggle */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <LanguageToggle currentLocale={locale} />
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
