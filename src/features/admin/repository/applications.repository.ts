import { supabaseAdmin } from '@src/shared/lib/supabase-admin'
import type { AdminApplication } from '../types'

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/** Normaliza relaciones 1:1 que Supabase puede devolver como {} o [{}]. */
function one<T>(raw: T | T[] | null | undefined): T | null {
  if (raw === null || raw === undefined) return null
  return Array.isArray(raw) ? (raw[0] ?? null) : raw
}

// ---------------------------------------------------------------------------
// Tipos de fila crudos devueltos por Supabase
// ---------------------------------------------------------------------------

type RawEntrepreneur = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  cedula: string
  fb_profile_url: string | null
}

type RawBusinessProfile = {
  id: string
  business_name: string | null
  category: string | null
  description: string | null
  business_phone: string | null
  instagram_handle: string | null
  website_url: string | null
  directory_image_path: string | null
  offers_discount: boolean
  discount_details: string | null
}

type RawProduct = {
  id: string
  name: string
  price_cop: number
  duration_days: number | null
}

type RawApplication = {
  id: string
  status: 'pendiente' | 'aprobado' | 'rechazado'
  amount_cop: number
  submitted_at: string
  reviewed_at: string | null
  notes: string | null
  receipt_path: string
  post_screenshot_path: string | null
  entrepreneur_id: string
  entrepreneurs: RawEntrepreneur | RawEntrepreneur[] | null
  products: RawProduct | RawProduct[] | null
}

// ---------------------------------------------------------------------------
// listApplications (was: getAdminApplications)
// ---------------------------------------------------------------------------

export async function listApplications(
  status?: 'pendiente' | 'aprobado' | 'rechazado'
): Promise<AdminApplication[]> {
  let query = supabaseAdmin
    .from('applications')
    .select(`
      id, status, amount_cop, submitted_at, reviewed_at, notes,
      receipt_path, post_screenshot_path, entrepreneur_id,
      entrepreneurs (
        id, full_name, email, phone, cedula, fb_profile_url
      ),
      products ( id, name, price_cop, duration_days )
    `)
    .order('submitted_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data: apps, error } = await query.returns<RawApplication[]>()
  if (error) throw new Error(error.message)
  if (!apps || apps.length === 0) return []

  const entrepreneurIds = apps.map((a) => a.entrepreneur_id)
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('business_profiles')
    .select(`
      id, entrepreneur_id, business_name, category, description,
      business_phone, instagram_handle, website_url,
      directory_image_path, offers_discount, discount_details
    `)
    .in('entrepreneur_id', entrepreneurIds)
    .returns<(RawBusinessProfile & { entrepreneur_id: string })[]>()

  if (profilesError) throw new Error(profilesError.message)

  const profileMap = new Map<string, RawBusinessProfile>()
  for (const p of profiles ?? []) {
    profileMap.set(p.entrepreneur_id, p)
  }

  return apps.map((app): AdminApplication => {
    const entrepreneur = one(app.entrepreneurs)
    const product = one(app.products)
    const bp = profileMap.get(app.entrepreneur_id)

    if (!entrepreneur) throw new Error(`Entrepreneur missing for application ${app.id}`)
    if (!product) throw new Error(`Product missing for application ${app.id}`)

    return {
      id: app.id,
      status: app.status,
      amount_cop: app.amount_cop,
      submitted_at: app.submitted_at,
      reviewed_at: app.reviewed_at,
      notes: app.notes,
      receipt_path: app.receipt_path,
      post_screenshot_path: app.post_screenshot_path,
      entrepreneur: {
        id: entrepreneur.id,
        full_name: entrepreneur.full_name,
        email: entrepreneur.email,
        phone: entrepreneur.phone,
        cedula: entrepreneur.cedula,
        fb_profile_url: entrepreneur.fb_profile_url,
      },
      business_profile: {
        id: bp?.id ?? '',
        business_name: bp?.business_name ?? null,
        category: bp?.category ?? null,
        description: bp?.description ?? null,
        business_phone: bp?.business_phone ?? null,
        instagram_handle: bp?.instagram_handle ?? null,
        website_url: bp?.website_url ?? null,
        directory_image_path: bp?.directory_image_path ?? null,
        offers_discount: bp?.offers_discount ?? false,
        discount_details: bp?.discount_details ?? null,
      },
      product: {
        id: product.id,
        name: product.name,
        price_cop: product.price_cop,
        duration_days: product.duration_days,
      },
    }
  })
}

// ---------------------------------------------------------------------------
// getApplicationById (was: getAdminApplicationById)
// ---------------------------------------------------------------------------

export async function getApplicationById(id: string): Promise<AdminApplication | null> {
  const { data: app, error } = await supabaseAdmin
    .from('applications')
    .select(`
      id, status, amount_cop, submitted_at, reviewed_at, notes,
      receipt_path, post_screenshot_path, entrepreneur_id,
      entrepreneurs (
        id, full_name, email, phone, cedula, fb_profile_url
      ),
      products ( id, name, price_cop, duration_days )
    `)
    .eq('id', id)
    .single<RawApplication>()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }
  if (!app) return null

  const { data: bp, error: bpError } = await supabaseAdmin
    .from('business_profiles')
    .select(`
      id, business_name, category, description, business_phone,
      instagram_handle, website_url, directory_image_path,
      offers_discount, discount_details
    `)
    .eq('entrepreneur_id', app.entrepreneur_id)
    .single<RawBusinessProfile>()

  if (bpError && bpError.code !== 'PGRST116') throw new Error(bpError.message)

  const entrepreneur = one(app.entrepreneurs)
  const product = one(app.products)

  if (!entrepreneur) throw new Error(`Entrepreneur missing for application ${app.id}`)
  if (!product) throw new Error(`Product missing for application ${app.id}`)

  return {
    id: app.id,
    status: app.status,
    amount_cop: app.amount_cop,
    submitted_at: app.submitted_at,
    reviewed_at: app.reviewed_at,
    notes: app.notes,
    receipt_path: app.receipt_path,
    post_screenshot_path: app.post_screenshot_path,
    entrepreneur: {
      id: entrepreneur.id,
      full_name: entrepreneur.full_name,
      email: entrepreneur.email,
      phone: entrepreneur.phone,
      cedula: entrepreneur.cedula,
      fb_profile_url: entrepreneur.fb_profile_url,
    },
    business_profile: {
      id: bp?.id ?? '',
      business_name: bp?.business_name ?? null,
      category: bp?.category ?? null,
      description: bp?.description ?? null,
      business_phone: bp?.business_phone ?? null,
      instagram_handle: bp?.instagram_handle ?? null,
      website_url: bp?.website_url ?? null,
      directory_image_path: bp?.directory_image_path ?? null,
      offers_discount: bp?.offers_discount ?? false,
      discount_details: bp?.discount_details ?? null,
    },
    product: {
      id: product.id,
      name: product.name,
      price_cop: product.price_cop,
      duration_days: product.duration_days,
    },
  }
}

// ---------------------------------------------------------------------------
// approveApplication
// ---------------------------------------------------------------------------

export async function approveApplication(
  applicationId: string,
  _entrepreneurId: string,
  _durationDays: number
): Promise<void> {
  const now = new Date().toISOString()

  const { error: appError } = await supabaseAdmin
    .from('applications')
    .update({ status: 'aprobado', reviewed_at: now })
    .eq('id', applicationId)

  if (appError) throw new Error(`Error al aprobar solicitud: ${appError.message}`)
}

// ---------------------------------------------------------------------------
// rejectApplication
// ---------------------------------------------------------------------------

export async function rejectApplication(
  applicationId: string,
  notes?: string
): Promise<void> {
  const now = new Date().toISOString()

  const { data: appRow, error: readError } = await supabaseAdmin
    .from('applications')
    .select('entrepreneur_id')
    .eq('id', applicationId)
    .single<{ entrepreneur_id: string }>()

  if (readError) throw new Error(readError.message)

  const appUpdate: Record<string, unknown> = { status: 'rechazado', reviewed_at: now }
  if (notes !== undefined) appUpdate.notes = notes

  const { error: appError } = await supabaseAdmin
    .from('applications')
    .update(appUpdate)
    .eq('id', applicationId)

  if (appError) throw new Error(`Error al rechazar solicitud: ${appError.message}`)

  const { error: memError } = await supabaseAdmin
    .from('memberships')
    .update({ status: 'inactive' })
    .eq('entrepreneur_id', appRow.entrepreneur_id)

  if (memError) throw new Error(`Error al desactivar membresía: ${memError.message}`)
}
