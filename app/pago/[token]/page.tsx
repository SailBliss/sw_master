import { Suspense } from 'react'
import { PublicNavbar } from '@src/components/public'
import { PaymentStart } from './PaymentStart'

export default async function PagoPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  return (
    <main className="min-h-screen bg-[--bg] text-[--fg]">
      <Suspense fallback={null}>
        <PublicNavbar />
      </Suspense>
      <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
        <p className="sw-eyebrow">Pago seguro</p>
        <h1 className="sw-display sw-h2 mt-3 text-[--fg]">Completa tu pago en Wompi</h1>
        <p className="mt-4 text-sm leading-relaxed text-[--fg-2]">
          Tu solicitud fue habilitada para pago. Al continuar saldras a Wompi; SW Mujeres solo activara la membresia cuando el pago sea confirmado por backend.
        </p>
        <PaymentStart paymentTransactionId={token} />
      </section>
    </main>
  )
}
