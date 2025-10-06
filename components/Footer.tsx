import { Locale } from '@/lib/i18n'

interface FooterProps {
  locale: Locale
  contactEmail?: string
  socialLinks?: Array<{
    platform: string
    url: string
  }>
  copyright: string
}

export default function Footer({
  locale,
  contactEmail,
  socialLinks,
  copyright,
}: FooterProps) {
  const currentYear = new Date().getFullYear()
  const copyrightText = copyright.replace('{year}', currentYear.toString())

  return (
    <footer className="bg-neutral-50 border-t border-neutral-200 mt-24">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact */}
          {contactEmail && (
            <div>
              <h3 className="font-sans text-sm font-bold uppercase tracking-wide text-neutral-900 mb-3">
                {locale === 'en' ? 'Contact' : 'Contacto'}
              </h3>
              <a
                href={`mailto:${contactEmail}`}
                className="text-neutral-700 hover:text-primary transition-colors"
              >
                {contactEmail}
              </a>
            </div>
          )}

          {/* Social Links */}
          {socialLinks && socialLinks.length > 0 && (
            <div>
              <h3 className="font-sans text-sm font-bold uppercase tracking-wide text-neutral-900 mb-3">
                {locale === 'en' ? 'Follow' : 'Seguir'}
              </h3>
              <div className="flex flex-col gap-2">
                {socialLinks.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-700 hover:text-primary transition-colors"
                  >
                    {link.platform}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Copyright */}
          <div className="md:text-right">
            <p className="text-sm text-neutral-600">{copyrightText}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
