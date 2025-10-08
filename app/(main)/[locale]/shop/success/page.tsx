import Link from 'next/link'
import { Locale } from '@/lib/i18n'

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ session_id?: string }>
}) {
  const { locale } = await params
  const { session_id } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="container max-w-2xl text-center py-20">
        <div className="mb-8">
          <svg
            className="w-20 h-20 mx-auto text-green-500"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="font-serif text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
          {locale === 'en' ? 'Order Confirmed!' : '¡Pedido Confirmado!'}
        </h1>

        <p className="text-lg text-neutral-700 mb-8">
          {locale === 'en'
            ? 'Thank you for your purchase. You will receive a confirmation email shortly with your order details.'
            : 'Gracias por su compra. Recibirá un correo electrónico de confirmación en breve con los detalles de su pedido.'}
        </p>

        {session_id && (
          <p className="text-sm text-neutral-500 mb-8">
            {locale === 'en' ? 'Order ID:' : 'ID de pedido:'} {session_id}
          </p>
        )}

        <div className="flex gap-4 justify-center">
          <Link
            href={`/${locale}/shop`}
            className="px-6 py-3 border border-neutral-300 text-neutral-900 hover:border-primary hover:text-primary transition-colors"
          >
            {locale === 'en' ? 'Continue Shopping' : 'Continuar Comprando'}
          </Link>
          <Link
            href={`/${locale}`}
            className="px-6 py-3 bg-primary text-white hover:bg-primary-dark transition-colors"
          >
            <span className="text-white">{locale === 'en' ? 'Back to Home' : 'Volver al Inicio'}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
