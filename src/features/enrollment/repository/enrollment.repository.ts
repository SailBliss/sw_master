import { supabaseAdmin } from '@src/shared/lib/supabase-admin'
import type { ApplicationEditorialStatus } from '@src/features/profile-editorial-review/types'

export type EnrollmentIdentity =
  | { status: 'new'; entrepreneurId: string }
  | { status: 'existing'; entrepreneurId: string }
  | { status: 'blocked'; message: string }

export async function resolveEnrollmentIdentity(cedula: string): Promise<EnrollmentIdentity> {
  const { data, error } = await supabaseAdmin
    .from('entrepreneurs')
    .select('id, is_blocked, blocked_reason')
    .eq('cedula', cedula)
    .maybeSingle<{ id: string; is_blocked: boolean; blocked_reason: string | null }>()

  if (error) throw new Error(`Error al verificar la cedula: ${error.message}`)

  if (!data) {
    return { status: 'new', entrepreneurId: crypto.randomUUID() }
  }

  if (data.is_blocked) {
    return {
      status: 'blocked',
      message: data.blocked_reason
        ? `No podemos recibir una nueva solicitud para esta cedula. Motivo: ${data.blocked_reason}`
        : 'No podemos recibir una nueva solicitud para esta cedula. Contactanos para revisar tu caso.',
    }
  }

  return { status: 'existing', entrepreneurId: data.id }
}

export async function getProduct(
  productId: string
): Promise<{ id: string; price_cop: number; duration_days: number | null } | null> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id, price_cop, duration_days')
    .eq('id', productId)
    .eq('is_active', true)
    .maybeSingle()

  if (error) throw new Error(`Error al obtener producto: ${error.message}`)
  return data
}

type CreateEnrollmentParams = {
  identityStatus: 'new' | 'existing'
  entrepreneurId: string
  cedula: string
  full_name: string
  email: string
  phone: string
  fb_profile_url: string
  business_name: string
  description: string
  category: string
  business_phone: string
  instagram_handle: string | null
  website_url: string | null
  other_socials: string | null
  offers_discount: boolean
  discount_details: string | null
  product_id: string
  amount_cop: number
  receipt_path: string | null
  post_screenshot_path: string | null
  description_editorial_status: ApplicationEditorialStatus
  description_review_id: string | null
  description_reviewed: boolean
}

async function createBusinessProfile(params: CreateEnrollmentParams): Promise<void> {
  const profileInsert: Record<string, unknown> = {
    entrepreneur_id: params.entrepreneurId,
    business_name: params.business_name,
    description: params.description,
    category: params.category,
    business_phone: params.business_phone,
    offers_discount: params.offers_discount,
    wants_directory: true,
    directory_image_path: null,
    stats_token: crypto.randomUUID(),
  }

  if (params.instagram_handle) profileInsert.instagram_handle = params.instagram_handle
  if (params.website_url) profileInsert.website_url = params.website_url
  if (params.other_socials) profileInsert.other_socials = params.other_socials
  if (params.discount_details) profileInsert.discount_details = params.discount_details

  const { error } = await supabaseAdmin.from('business_profiles').insert(profileInsert)
  if (error) throw new Error(`Error al insertar perfil: ${error.message}`)
}

async function ensureMembership(entrepreneurId: string, applicationId: string, identityStatus: 'new' | 'existing'): Promise<void> {
  if (identityStatus === 'new') {
    const { error } = await supabaseAdmin
      .from('memberships')
      .insert({ entrepreneur_id: entrepreneurId, status: 'inactive', last_application_id: applicationId })

    if (error) throw new Error(`Error al crear membresia: ${error.message}`)
    return
  }

  const { data, error } = await supabaseAdmin
    .from('memberships')
    .update({ last_application_id: applicationId })
    .eq('entrepreneur_id', entrepreneurId)
    .select('id')
    .maybeSingle<{ id: string }>()

  if (error) throw new Error(`Error al actualizar membresia: ${error.message}`)
  if (data) return

  const { error: insertError } = await supabaseAdmin
    .from('memberships')
    .insert({ entrepreneur_id: entrepreneurId, status: 'inactive', last_application_id: applicationId })

  if (insertError) throw new Error(`Error al crear membresia: ${insertError.message}`)
}

export async function createEnrollmentApplication(params: CreateEnrollmentParams): Promise<string> {
  const createdNewIdentity = params.identityStatus === 'new'

  if (createdNewIdentity) {
    const { error } = await supabaseAdmin.from('entrepreneurs').insert({
      id: params.entrepreneurId,
      cedula: params.cedula,
      full_name: params.full_name,
      email: params.email,
      phone: params.phone,
      fb_profile_url: params.fb_profile_url,
      consent_accepted: true,
      consent_accepted_at: new Date().toISOString(),
    })

    if (error) throw new Error(`Error al insertar emprendedora: ${error.message}`)
  }

  try {
    if (createdNewIdentity) {
      await createBusinessProfile(params)
    }

    const { data: application, error: appError } = await supabaseAdmin
      .from('applications')
      .insert({
        entrepreneur_id: params.entrepreneurId,
        product_id: params.product_id,
        status: 'pendiente',
        amount_cop: params.amount_cop,
        receipt_path: params.receipt_path,
        post_screenshot_path: params.post_screenshot_path,
        description_editorial_status: params.description_editorial_status,
        description_review_id: params.description_review_id,
        description_reviewed: params.description_reviewed,
      })
      .select('id')
      .single<{ id: string }>()

    if (appError || !application) {
      throw new Error(`Error al insertar solicitud: ${appError?.message ?? 'sin datos'}`)
    }

    try {
      await ensureMembership(params.entrepreneurId, application.id, params.identityStatus)
    } catch (membershipError) {
      await supabaseAdmin.from('applications').delete().eq('id', application.id)
      throw membershipError
    }

    return application.id
  } catch (error) {
    if (createdNewIdentity) {
      await supabaseAdmin.from('business_profiles').delete().eq('entrepreneur_id', params.entrepreneurId)
      await supabaseAdmin.from('entrepreneurs').delete().eq('id', params.entrepreneurId)
    }
    throw error
  }
}
