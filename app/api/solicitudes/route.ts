// Maneja el envío del formulario de inscripción. Valida campos y archivos, verifica duplicados,
// sube archivos a Storage, inserta en 5 tablas con rollback manual y notifica a la admin.
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { uploadReceipt, uploadPostScreenshot } from '@/lib/storage'
import { notifyAdminNewApplication } from '@/lib/email'
import type { SubmissionResult } from '@/lib/types'

// Campos de texto obligatorios que deben llegar en el FormData
const REQUIRED_TEXT_FIELDS = [
  'cedula',
  'full_name',
  'email',
  'phone',
  'fb_profile_url',
  'business_name',
  'description',
  'category',
  'business_phone',
  'product_id',
  'consent_accepted',
] as const

type RequiredField = (typeof REQUIRED_TEXT_FIELDS)[number]

export async function POST(request: NextRequest): Promise<NextResponse<SubmissionResult>> {
  // ─── 1. RECIBIR ────────────────────────────────────────────────────────────
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json(
      { success: false, message: 'No se pudo leer el formulario.' },
      { status: 400 }
    )
  }

  // ─── 2. VALIDAR CAMPOS OBLIGATORIOS ────────────────────────────────────────
  const missing: string[] = []

  for (const field of REQUIRED_TEXT_FIELDS) {
    const value = formData.get(field)
    if (!value || String(value).trim() === '') {
      missing.push(field)
    }
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

  // Receipt se valida después del lookup del producto — solo obligatorio si price_cop > 0
  const receiptFile = formData.get('receipt')

  // Extraer campos de texto validados
  const cedula          = String(formData.get('cedula')).trim()
  const full_name       = String(formData.get('full_name')).trim()
  const email           = String(formData.get('email')).trim()
  const phone           = String(formData.get('phone')).trim()
  const fb_profile_url  = String(formData.get('fb_profile_url')).trim()
  const business_name   = String(formData.get('business_name')).trim()
  const description     = String(formData.get('description')).trim()
  const category        = String(formData.get('category')).trim()
  const business_phone  = String(formData.get('business_phone')).trim()
  const product_id      = String(formData.get('product_id')).trim()

  // Campos opcionales — solo se incluyen si tienen valor real
  const instagram_raw  = formData.get('instagram_handle')
  const website_raw    = formData.get('website_url')
  const other_raw      = formData.get('other_socials')
  const discount_raw   = formData.get('discount_details')
  const offers_raw     = formData.get('offers_discount')

  const instagram_handle = instagram_raw && String(instagram_raw).trim() !== '' ? String(instagram_raw).trim() : null
  const website_url      = website_raw   && String(website_raw).trim()   !== '' ? String(website_raw).trim()   : null
  const other_socials    = other_raw     && String(other_raw).trim()     !== '' ? String(other_raw).trim()     : null
  const discount_details = discount_raw  && String(discount_raw).trim()  !== '' ? String(discount_raw).trim()  : null
  const offers_discount  = String(offers_raw).trim() === 'true'

  const screenshotFile = formData.get('post_screenshot')
  const postScreenshot = screenshotFile instanceof File && screenshotFile.size > 0 ? screenshotFile : null

  // ─── 3. VERIFICAR DUPLICADO POR CÉDULA ─────────────────────────────────────
  const { data: existing, error: dupeError } = await supabaseAdmin
    .from('entrepreneurs')
    .select('id')
    .eq('cedula', cedula)
    .maybeSingle()

  if (dupeError) {
    console.error('[solicitudes] Error al verificar cédula duplicada:', dupeError)
    return NextResponse.json(
      { success: false, message: 'Error interno al verificar los datos. Intenta de nuevo.' },
      { status: 500 }
    )
  }

  if (existing) {
    return NextResponse.json(
      {
        success: false,
        message: 'Ya existe una solicitud con esta cédula. Si crees que es un error, contáctanos.',
      },
      { status: 409 }
    )
  }

  // ─── 4. OBTENER PRECIO DEL PRODUCTO ────────────────────────────────────────
  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .select('id, price_cop')
    .eq('id', product_id)
    .eq('is_active', true)
    .maybeSingle()

  if (productError || !product) {
    return NextResponse.json(
      { success: false, message: 'El plan seleccionado no es válido.' },
      { status: 400 }
    )
  }

  // Comprobante obligatorio solo para planes de pago
  const isPaidPlan = product.price_cop > 0
  if (isPaidPlan && (!(receiptFile instanceof File) || receiptFile.size === 0)) {
    return NextResponse.json(
      { success: false, message: 'El comprobante de pago es obligatorio para este plan.' },
      { status: 400 }
    )
  }

  // ─── 5. GENERAR ID + SUBIR ARCHIVOS ────────────────────────────────────────
  const entrepreneurId = crypto.randomUUID()

  let receiptPath = ''
  try {
    if (isPaidPlan && receiptFile instanceof File) {
      receiptPath = await uploadReceipt(receiptFile, entrepreneurId)
    }
  } catch (err) {
    console.error('[solicitudes] Error al subir comprobante:', err)
    return NextResponse.json(
      { success: false, message: 'No se pudo subir el comprobante. Intenta de nuevo.' },
      { status: 500 }
    )
  }

  let postScreenshotPath: string | null = null
  if (postScreenshot) {
    try {
      postScreenshotPath = await uploadPostScreenshot(postScreenshot, entrepreneurId)
    } catch (err) {
      console.error('[solicitudes] Error al subir captura de post:', err)
      // No es obligatorio — continuamos sin ella
    }
  }

  // ─── 6. INSERTS CON ROLLBACK MANUAL ────────────────────────────────────────
  // a) entrepreneurs
  const { error: errEntrepreneur } = await supabaseAdmin
    .from('entrepreneurs')
    .insert({
      id: entrepreneurId,
      cedula,
      full_name,
      email,
      phone,
      fb_profile_url,
      consent_accepted: true,
      consent_accepted_at: new Date().toISOString(),
    })

  if (errEntrepreneur) {
    console.error('[solicitudes] Error al insertar entrepreneur:', errEntrepreneur)
    return NextResponse.json(
      { success: false, message: 'Error al guardar los datos. Intenta de nuevo.' },
      { status: 500 }
    )
  }

  // b) business_profiles
  const businessProfileInsert: Record<string, unknown> = {
    entrepreneur_id: entrepreneurId,
    business_name,
    description,
    category,
    business_phone,
    offers_discount,
    wants_directory: true,
    directory_image_path: null,
  }
  if (instagram_handle) businessProfileInsert.instagram_handle = instagram_handle
  if (website_url)      businessProfileInsert.website_url = website_url
  if (other_socials)    businessProfileInsert.other_socials = other_socials
  if (discount_details) businessProfileInsert.discount_details = discount_details

  const { error: errProfile } = await supabaseAdmin
    .from('business_profiles')
    .insert(businessProfileInsert)

  if (errProfile) {
    console.error('[solicitudes] Error al insertar business_profile:', errProfile)
    await supabaseAdmin.from('entrepreneurs').delete().eq('id', entrepreneurId)
    return NextResponse.json(
      { success: false, message: 'Error al guardar el perfil del negocio. Intenta de nuevo.' },
      { status: 500 }
    )
  }

  // c) applications
  const { data: application, error: errApplication } = await supabaseAdmin
    .from('applications')
    .insert({
      entrepreneur_id: entrepreneurId,
      product_id,
      status: 'pendiente',
      amount_cop: product.price_cop,
      receipt_path: receiptPath,
      post_screenshot_path: postScreenshotPath,
    })
    .select('id')
    .single()

  if (errApplication || !application) {
    console.error('[solicitudes] Error al insertar application:', errApplication)
    await supabaseAdmin.from('business_profiles').delete().eq('entrepreneur_id', entrepreneurId)
    await supabaseAdmin.from('entrepreneurs').delete().eq('id', entrepreneurId)
    return NextResponse.json(
      { success: false, message: 'Error al registrar la solicitud. Intenta de nuevo.' },
      { status: 500 }
    )
  }

  const applicationId = application.id as string

  // d) profile_reviews
  const { error: errReview } = await supabaseAdmin
    .from('profile_reviews')
    .insert({
      entrepreneur_id: entrepreneurId,
      status: 'pendiente',
    })

  if (errReview) {
    console.error('[solicitudes] Error al insertar profile_review:', errReview)
    await supabaseAdmin.from('applications').delete().eq('id', applicationId)
    await supabaseAdmin.from('business_profiles').delete().eq('entrepreneur_id', entrepreneurId)
    await supabaseAdmin.from('entrepreneurs').delete().eq('id', entrepreneurId)
    return NextResponse.json(
      { success: false, message: 'Error al registrar la revisión. Intenta de nuevo.' },
      { status: 500 }
    )
  }

  // e) memberships
  const { error: errMembership } = await supabaseAdmin
    .from('memberships')
    .insert({
      entrepreneur_id: entrepreneurId,
      status: 'inactive',
      last_application_id: applicationId,
    })

  if (errMembership) {
    console.error('[solicitudes] Error al insertar membership:', errMembership)
    await supabaseAdmin.from('profile_reviews').delete().eq('entrepreneur_id', entrepreneurId)
    await supabaseAdmin.from('applications').delete().eq('id', applicationId)
    await supabaseAdmin.from('business_profiles').delete().eq('entrepreneur_id', entrepreneurId)
    await supabaseAdmin.from('entrepreneurs').delete().eq('id', entrepreneurId)
    return NextResponse.json(
      { success: false, message: 'Error al crear la membresía. Intenta de nuevo.' },
      { status: 500 }
    )
  }

  // ─── 7. NOTIFICAR A LA ADMIN ────────────────────────────────────────────────
  // Si el email falla, no interrumpimos la respuesta — la solicitud ya está guardada.
  try {
    await notifyAdminNewApplication({
      entrepreneurName: full_name,
      businessName: business_name,
      category,
    })
  } catch (emailErr) {
    console.error('[solicitudes] Error al enviar email a admin (no bloquea):', emailErr)
  }

  // ─── 8. RESPUESTA ──────────────────────────────────────────────────────────
  return NextResponse.json(
    {
      success: true,
      message: '¡Tu solicitud fue enviada! Revisaremos tu información y te contactaremos pronto.',
      applicationId,
    },
    { status: 200 }
  )
}
