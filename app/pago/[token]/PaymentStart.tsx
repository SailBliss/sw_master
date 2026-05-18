'use client'

import { useState } from 'react'
import Link from 'next/link'

export function PaymentStart({ paymentTransactionId }: { paymentTransactionId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function startCheckout() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/payments/wompi/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentTransactionId }),
      })
      const result = await response.json() as { success: boolean; checkoutUrl?: string; message?: string }

      if (!response.ok || !result.success || !result.checkoutUrl) {
        throw new Error(result.message ?? 'No se pudo iniciar el pago.')
      }

      window.location.href = result.checkoutUrl
    } catch (error) {
      setError(error instanceof Error ? error.message : 'No se pudo iniciar el pago.')
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className="mt-8 rounded-full bg-[--accent] px-7 py-3 text-sm font-semibold text-[--sw-cream] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Preparando Wompi...' : 'Pagar con Wompi'}
      </button>
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      <Link href="/directorio" className="mt-6 text-sm font-medium text-[--accent]">
        Volver al directorio
      </Link>
    </>
  )
}
