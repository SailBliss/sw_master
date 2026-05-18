import { NextRequest, NextResponse } from 'next/server'
import { getCheckoutForPaymentTransaction } from '@src/features/payments/services/wompi.service'

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, message: 'JSON invalido.' }, { status: 400 })
  }

  const paymentTransactionId = String((body as { paymentTransactionId?: unknown }).paymentTransactionId ?? '').trim()
  if (!paymentTransactionId) {
    return NextResponse.json({ success: false, message: 'paymentTransactionId requerido.' }, { status: 400 })
  }

  try {
    const checkout = await getCheckoutForPaymentTransaction(paymentTransactionId)
    return NextResponse.json({ success: true, ...checkout })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo iniciar el pago.'
    return NextResponse.json({ success: false, message }, { status: 400 })
  }
}
