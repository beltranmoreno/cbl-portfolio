import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const { items, locale } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      )
    }

    const origin = request.headers.get('origin') || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price: item.stripePriceId,
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${origin}/${locale}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${locale}/shop`,
      locale: locale === 'es' ? 'es' : 'en',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'ES', 'FR', 'DE', 'IT'],
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
