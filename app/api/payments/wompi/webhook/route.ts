import { NextRequest, NextResponse } from 'next/server'
import { processVerifiedWompiEvent, verifyWompiEventChecksum } from '@src/features/payments/services/wompi.service'

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, message: 'JSON invalido.' }, { status: 400 })
  }

  try {
    const checksum = request.headers.get('x-event-checksum')
    if (!verifyWompiEventChecksum(body, checksum)) {
      return NextResponse.json({ success: false, message: 'Firma Wompi invalida.' }, { status: 401 })
    }

    const result = await processVerifiedWompiEvent(body)
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error procesando evento Wompi.'
    return NextResponse.json({ success: false, message }, { status: 400 })
  }
}
