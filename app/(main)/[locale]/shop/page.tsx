import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Locale, getTranslations, getLocalizedField, getLocalizedSlug, getProductTypeLabel } from '@/lib/i18n'
import { getAllProducts } from '@/lib/sanity.queries'
import { buildMetadata } from '@/lib/seo'
import { urlForImage } from '@/lib/sanity.client'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const l = (locale === 'es' ? 'es' : 'en') as 'en' | 'es'
  const products = await getAllProducts()
  const ogImage = products[0]?.images?.[0]
  return buildMetadata({
    title: l === 'es' ? 'Tienda' : 'Shop',
    description:
      l === 'es'
        ? 'Compra impresiones limitadas, libros y publicaciones de Carmen Ballvé. Fotografía documental en blanco y negro.'
        : 'Shop limited-edition prints, books, and publications from Carmen Ballvé. Black-and-white documentary photography.',
    pathEn: 'shop',
    pathEs: 'shop',
    locale: l,
    image: ogImage,
  })
}

export default async function ShopPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const resolvedParams = await params
  const locale = resolvedParams.locale as Locale
  const translations = getTranslations(locale)
  const products = await getAllProducts()

  return (
    <div className="min-h-screen">
      <div className="container py-12 md:py-16">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-neutral-900 mb-12 text-center">
          {locale === 'en' ? 'Shop' : 'Tienda'}
        </h1>

        {/* Product List */}
        <div className="flex flex-col gap-10 max-w-4xl mx-auto">
          {products.map((product) => {
            const title = getLocalizedField(product, 'title', locale)
            const slug = getLocalizedSlug(product.slug, locale)?.current || ''

            return (
              <Link
                key={product._id}
                href={`/${locale}/shop/${slug}`}
                className="group flex flex-col sm:flex-row gap-6 sm:gap-8 items-start"
              >
                <div className="relative w-40 sm:w-56 aspect-[3/4] overflow-hidden bg-neutral-100 shrink-0">
                  <Image
                    src={urlForImage(product.images[0]).width(400).url()}
                    alt={title || 'Product'}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 160px, 224px"
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-white text-neutral-900 px-3 py-1.5 font-bold text-xs">
                        {translations.common.soldOut}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 sm:py-2">
                  {product.productType && (
                    <p className="text-xs font-bold uppercase tracking-wide text-neutral-500 mb-2">
                      {getProductTypeLabel(product.productType, locale)}
                    </p>
                  )}

                  <h2 className="font-sans text-xl font-medium text-neutral-900 mb-2 group-hover:text-primary transition-colors">
                    {title}
                  </h2>

                  <p className="text-neutral-700 font-medium text-lg">
                    ${product.price.toFixed(2)}
                  </p>

                  {product.inStock ? (
                    <span className="inline-block mt-4 text-sm text-neutral-600 border-b border-neutral-400 group-hover:border-primary group-hover:text-primary transition-colors">
                      {translations.common.viewDetails}
                    </span>
                  ) : (
                    <span className="inline-block mt-4 text-sm text-neutral-400">
                      {translations.common.outOfStock}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-neutral-600 text-lg">
              {locale === 'en'
                ? 'No products available at the moment.'
                : 'No hay productos disponibles en este momento.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
