import Link from 'next/link'
import Image from 'next/image'
import { Locale, getTranslations, getLocalizedField } from '@/lib/i18n'
import { getAllProducts } from '@/lib/sanity.queries'
import { urlForImage } from '@/lib/sanity.client'

export default async function ShopPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const translations = getTranslations(locale)
  const products = await getAllProducts()

  return (
    <div className="min-h-screen">
      <div className="container py-12 md:py-16">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-neutral-900 mb-12 text-center">
          {locale === 'en' ? 'Shop' : 'Tienda'}
        </h1>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => {
            const title = getLocalizedField(product, 'title', locale)
            const slug = getLocalizedField(product, 'slug', locale)?.current

            return (
              <Link
                key={product._id}
                href={`/${locale}/shop/${slug}`}
                className="group"
              >
                <div className="relative aspect-square mb-4 overflow-hidden bg-neutral-100">
                  <Image
                    src={urlForImage(product.images[0]).width(400).url()}
                    alt={title || 'Product'}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-white text-neutral-900 px-4 py-2 font-bold text-sm">
                        {translations.common.soldOut}
                      </span>
                    </div>
                  )}
                </div>

                <h2 className="font-sans text-lg font-medium text-neutral-900 mb-2 group-hover:text-primary transition-colors">
                  {title}
                </h2>

                <p className="text-neutral-700 font-medium">
                  ${product.price.toFixed(2)}
                </p>

                {product.inStock ? (
                  <span className="inline-block mt-2 text-sm text-neutral-600">
                    {translations.common.viewDetails}
                  </span>
                ) : (
                  <span className="inline-block mt-2 text-sm text-neutral-400">
                    {translations.common.outOfStock}
                  </span>
                )}
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
