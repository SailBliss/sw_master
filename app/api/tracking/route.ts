import { NextRequest, NextResponse } from 'next/server'
import { trackingService } from '@src/features/tracking/services/tracking.service'
import type { ContactClickType } from '@src/features/tracking/types'

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: { profileId?: string; type?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { profileId, type } = body

  if (!profileId || !type) {
    return NextResponse.json({ error: 'profileId and type are required' }, { status: 400 })
  }

  const validTypes: ContactClickType[] = ['whatsapp', 'instagram', 'website']
  if (!validTypes.includes(type as ContactClickType)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  await trackingService.recordClick(profileId, type as ContactClickType)

  return new NextResponse(null, { status: 204 })
}
