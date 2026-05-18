import { NextRequest, NextResponse } from 'next/server'
import { getWompiPaymentStatus } from '@src/features/payments/services/wompi.service'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const paymentTransactionId = request.nextUrl.searchParams.get('paymentTransactionId')?.trim()
  if (!paymentTransactionId) {
    return NextResponse.json({ success: false, message: 'paymentTransactionId requerido.' }, { status: 400 })
  }

  try {
    const status = await getWompiPaymentStatus(paymentTransactionId)
    return NextResponse.json({ success: true, ...status })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo consultar el pago.'
    return NextResponse.json({ success: false, message }, { status: 400 })
  }
}
