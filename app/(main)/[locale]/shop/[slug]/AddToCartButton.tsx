'use client'

import { useState } from 'react'
import { Locale } from '@/lib/i18n'
import type { Product, CommonTranslations } from '@/lib/types'

interface AddToCartButtonProps {
  product: Product
  locale: Locale
  translations: Pick<CommonTranslations, 'quantity' | 'addToCart'>
}

export default function AddToCartButton({
  product,
  locale,
  translations,
}: AddToCartButtonProps) {
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async () => {
    setIsAdding(true)

    // Get the price based on variant or base price
    const priceId =
      selectedVariant !== null && product.variants?.[selectedVariant]
        ? product.variants[selectedVariant].stripePriceId
        : product.stripeProductId

    if (!priceId) {
      alert('Product configuration error. Please contact support.')
      setIsAdding(false)
      return
    }

    try {
      // Call checkout API
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              stripePriceId: priceId,
              quantity,
            },
          ],
          locale,
        }),
      })

      const { sessionId } = await response.json()

      // Redirect to Stripe Checkout
      const stripe = await import('@stripe/stripe-js').then((mod) =>
        mod.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      )

      const stripeInstance = await stripe
      await stripeInstance?.redirectToCheckout({ sessionId })
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div>
        <label className="block text-sm font-bold uppercase tracking-wide text-neutral-700 mb-2">
          {translations.quantity}
        </label>
        <input
          type="number"
          min="1"
          max="10"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          className="w-24 px-4 py-2 border border-neutral-300 focus:border-primary focus:outline-none"
        />
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={isAdding}
        className="w-full px-8 py-4 bg-primary text-white font-medium text-lg hover:bg-primary-dark transition-colors disabled:bg-neutral-400 disabled:cursor-not-allowed"
      >
        {isAdding ? (locale === 'en' ? 'Processing...' : 'Procesando...') : translations.addToCart}
      </button>
    </div>
  )
}
