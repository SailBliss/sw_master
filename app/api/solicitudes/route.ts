import { NextRequest, NextResponse } from 'next/server'
import { enrollmentService } from '@src/features/enrollment/services/enrollment.service'
import type { SubmissionResult } from '@src/features/enrollment/types'

const REQUIRED_TEXT_FIELDS = [
  'cedula', 'full_name', 'email', 'phone', 'fb_profile_url',
  'business_name', 'description', 'category', 'business_phone',
  'product_id', 'consent_accepted',
] as const

export async function POST(request: NextRequest): Promise<NextResponse<SubmissionResult>> {
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ success: false, message: 'No se pudo leer el formulario.' }, { status: 400 })
  }

  const missing: string[] = []
  for (const field of REQUIRED_TEXT_FIELDS) {
    const value = formData.get(field)
    if (!value || String(value).trim() === '') missing.push(field)
  }
  if (missing.length > 0) {
    return NextResponse.json(
      { success: false, message: `Faltan campos obligatorios: ${missing.join(', ')}.` },
      { status: 400 }
    )
  }

  const consentRaw = String(formData.get('consent_accepted')).trim()
  if (consentRaw !== 'true') {
    return NextResponse.json(
      { success: false, message: 'Debes aceptar los términos para continuar.' },
      { status: 400 }
    )
  }

  const receiptFile = formData.get('receipt')
  const screenshotFile = formData.get('post_screenshot')

  const result = await enrollmentService.submit({
    cedula: String(formData.get('cedula')).trim(),
    full_name: String(formData.get('full_name')).trim(),
    email: String(formData.get('email')).trim(),
    phone: String(formData.get('phone')).trim(),
    fb_profile_url: String(formData.get('fb_profile_url')).trim(),
    business_name: String(formData.get('business_name')).trim(),
    description: String(formData.get('description')).trim(),
    category: String(formData.get('category')).trim(),
    business_phone: String(formData.get('business_phone')).trim(),
    instagram_handle: formData.get('instagram_handle') ? String(formData.get('instagram_handle')).trim() || null : null,
    website_url: formData.get('website_url') ? String(formData.get('website_url')).trim() || null : null,
    other_socials: formData.get('other_socials') ? String(formData.get('other_socials')).trim() || null : null,
    discount_details: formData.get('discount_details') ? String(formData.get('discount_details')).trim() || null : null,
    offers_discount: String(formData.get('offers_discount')).trim() === 'true',
    product_id: String(formData.get('product_id')).trim(),
    receipt: receiptFile instanceof File ? receiptFile : null,
    post_screenshot: screenshotFile instanceof File && (screenshotFile as File).size > 0 ? screenshotFile as File : null,
  })

  const statusCode = result.success ? 200 : result.message.includes('cédula') ? 409 : 400
  return NextResponse.json(result, { status: statusCode })
}
