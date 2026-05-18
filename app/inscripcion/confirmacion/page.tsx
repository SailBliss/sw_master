'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { PublicNavbar } from '@src/components/public'

type ViewStatus = 'loading' | 'confirmed' | 'pending' | 'error'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const paymentTransactionId = searchParams.get('paymentTransactionId')
  const [status, setStatus] = useState<ViewStatus>('loading')
  const [message, setMessage] = useState('Consultando el estado de tu pago...')

  useEffect(() => {
    async function loadStatus() {
      if (!paymentTransactionId) {
        setStatus('error')
        setMessage('No pudimos identificar la intencion de pago.')
        return
      }

      try {
        const response = await fetch(`/api/payments/wompi/status?paymentTransactionId=${encodeURIComponent(paymentTransactionId)}`)
        const result = await response.json() as {
          success: boolean
          paymentStatus?: string
          applicationStatus?: string
          message?: string
        }

        if (!response.ok || !result.success) {
          throw new Error(result.message ?? 'No se pudo consultar el pago.')
        }

        if (result.paymentStatus === 'paid' && result.applicationStatus === 'aprobado') {
          setStatus('confirmed')
          setMessage('Tu pago fue confirmado y la membresia quedo activa.')
          return
        }

        setStatus('pending')
        setMessage('Tu pago sigue pendiente de confirmacion. Wompi notificara automaticamente a SW Mujeres.')
      } catch (error) {
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'No se pudo consultar el pago.')
      }
    }

    loadStatus()
  }, [paymentTransactionId])

  const title =
    status === 'confirmed'
      ? 'Pago confirmado'
      : status === 'pending'
      ? 'Pago pendiente'
      : status === 'error'
      ? 'No pudimos consultar el pago'
      : 'Consultando pago'

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-semibold text-[--sw-cream]"
        style={{ background: status === 'error' ? '#8b2a2a' : 'var(--accent)' }}
      >
        {status === 'confirmed' ? 'OK' : status === 'error' ? '!' : '...'}
      </div>
      <h1 className="sw-display sw-h2 mt-5 text-[--fg]">{title}</h1>
      <p className="mt-4 text-sm leading-relaxed text-[--fg-2]">{message}</p>
      <Link
        href="/directorio"
        className="mt-8 rounded-full bg-[--accent] px-7 py-3 text-sm font-semibold text-[--sw-cream] transition hover:opacity-90"
      >
        Ver directorio
      </Link>
    </section>
  )
}

export default function ConfirmacionPage() {
  return (
    <main className="min-h-screen bg-[--bg] text-[--fg]">
      <Suspense fallback={null}>
        <PublicNavbar />
      </Suspense>
      <Suspense fallback={<section className="min-h-[70vh]" />}>
        <ConfirmationContent />
      </Suspense>
    </main>
  )
}
