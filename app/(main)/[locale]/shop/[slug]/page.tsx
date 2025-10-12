import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Locale, getTranslations, getLocalizedField, getLocalizedText } from '@/lib/i18n'
import { getProductBySlug, getAllProducts, type PortableTextBlock } from '@/lib/sanity.queries'
import { urlForImage } from '@/lib/sanity.client'
import AddToCartButton from './AddToCartButton'

export const dynamicParams = false

export async function generateStaticParams() {
  const products = await getAllProducts()

  const params = []
  for (const product of products) {
    if (product.slug?.en?.current && product.slug?.es?.current) {
      params.push(
        { locale: 'en' as Locale, slug: product.slug.en.current },
        { locale: 'es' as Locale, slug: product.slug.es.current }
      )
    }
  }

  return params
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params
  const translations = getTranslations(locale)
  const product = await getProductBySlug(slug, locale)

  if (!product) {
    notFound()
  }

  const title = getLocalizedField(product, 'title', locale)
  const description = getLocalizedText(product.description, locale)

  return (
    <div className="min-h-screen">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Product Images */}
          <div className="space-y-4">
            {product.images.map((image, index) => (
              <div key={index} className="relative aspect-square bg-neutral-100">
                <Image
                  src={urlForImage(image).width(800).url()}
                  alt={`${title} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                {title}
              </h1>
              <p className="text-2xl text-neutral-900 font-medium">
                ${product.price.toFixed(2)}
              </p>
            </div>

            {/* Description */}
            {description && (
              <div className="prose prose-lg max-w-none border-t border-neutral-200 pt-6">
                {description.map((block: PortableTextBlock, index: number) => {
                  if (block._type === 'block') {
                    return (
                      <p
                        key={index}
                        className="text-neutral-700 leading-relaxed mb-4"
                      >
                        {block.children?.map((child) => child.text).join('')}
                      </p>
                    )
                  }
                  return null
                })}
              </div>
            )}

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="border-t border-neutral-200 pt-6">
                <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-700 mb-4">
                  {locale === 'en' ? 'Options' : 'Opciones'}
                </h3>
                <div className="space-y-2">
                  {product.variants.map((variant, index) => {
                    const variantName = getLocalizedField(
                      variant,
                      'name',
                      locale
                    )
                    return (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 border border-neutral-200"
                      >
                        <span className="text-neutral-900">{variantName}</span>
                        <span className="text-neutral-700 font-medium">
                          ${variant.price.toFixed(2)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <div className="border-t border-neutral-200 pt-6">
              {product.inStock ? (
                <AddToCartButton
                  product={product}
                  locale={locale}
                  translations={translations.common}
                />
              ) : (
                <button
                  disabled
                  className="w-full px-8 py-4 bg-neutral-300 text-neutral-600 font-medium text-lg cursor-not-allowed"
                >
                  {translations.common.outOfStock}
                </button>
              )}
            </div>

            {/* Related Project Link */}
            {product.relatedProject && (
              <div className="border-t border-neutral-200 pt-6">
                <p className="text-sm text-neutral-600 mb-2">
                  {locale === 'en' ? 'From the project:' : 'Del proyecto:'}
                </p>
                <a
                  href={`/${locale}/projects/${
                    (getLocalizedField(product.relatedProject, 'slug', locale) as { current?: string } | null)
                      ?.current || ''
                  }`}
                  className="text-primary hover:text-primary-dark font-medium transition-colors"
                >
                  {getLocalizedField(product.relatedProject, 'title', locale)}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
