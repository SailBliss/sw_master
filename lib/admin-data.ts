// lib/admin-data.ts
// Capa de acceso a datos para el panel de administración.
// Todas las queries usan supabaseAdmin (service role — bypasea RLS).
// Solo importar desde app/api/* o Server Components del panel admin.

import { supabaseAdmin } from '@/lib/supabase-admin'
import type { AdminApplication, AdminProfile, MembershipAlert } from '@/lib/types'

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/** Normaliza relaciones 1:1 que Supabase puede devolver como {} o [{}]. */
function one<T>(raw: T | T[] | null | undefined): T | null {
  if (raw === null || raw === undefined) return null
  return Array.isArray(raw) ? (raw[0] ?? null) : raw
}

/** Suma días a la fecha actual y devuelve ISO string. */
function addDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
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
// 1. getAdminApplications
// ---------------------------------------------------------------------------

export async function getAdminApplications(
  status?: 'pendiente' | 'aprobado' | 'rechazado'
): Promise<AdminApplication[]> {
  // Query principal: applications + entrepreneurs + products
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

  // Query secundaria: business_profiles por entrepreneur_id
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
// 2. getAdminApplicationById
// ---------------------------------------------------------------------------

export async function getAdminApplicationById(id: string): Promise<AdminApplication | null> {
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
    if (error.code === 'PGRST116') return null // row not found
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
// 3. approveApplication
// ---------------------------------------------------------------------------

export async function approveApplication(
  applicationId: string,
  entrepreneurId: string,
  durationDays: number
): Promise<void> {
  // Leer amount_cop de la application antes de modificarla
  const { data: appRow, error: readError } = await supabaseAdmin
    .from('applications')
    .select('amount_cop')
    .eq('id', applicationId)
    .single<{ amount_cop: number }>()

  if (readError) throw new Error(readError.message)

  const now = new Date().toISOString()
  const endAt = addDays(durationDays)

  // 1. Actualizar application
  const { error: appError } = await supabaseAdmin
    .from('applications')
    .update({ status: 'aprobado', reviewed_at: now })
    .eq('id', applicationId)

  if (appError) throw new Error(`Error al aprobar solicitud: ${appError.message}`)

  // 2. Actualizar membership
  const { error: memError } = await supabaseAdmin
    .from('memberships')
    .update({
      status: 'active',
      start_at: now,
      end_at: endAt,
      last_application_id: applicationId,
    })
    .eq('entrepreneur_id', entrepreneurId)

  if (memError) throw new Error(`Error al activar membresía: ${memError.message}`)

  // 3. Insertar en membership_periods
  const { error: periodError } = await supabaseAdmin
    .from('membership_periods')
    .insert({
      entrepreneur_id: entrepreneurId,
      application_id: applicationId,
      start_at: now,
      end_at: endAt,
      amount_cop: appRow.amount_cop,
      paid_at: now,
    })

  if (periodError) throw new Error(`Error al registrar período: ${periodError.message}`)
}

// ---------------------------------------------------------------------------
// 4. rejectApplication
// ---------------------------------------------------------------------------

export async function rejectApplication(
  applicationId: string,
  notes?: string
): Promise<void> {
  const now = new Date().toISOString()

  // Necesitamos el entrepreneur_id para actualizar memberships
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

// ---------------------------------------------------------------------------
// 5. getAdminProfiles
// ---------------------------------------------------------------------------

type RawProfileRow = {
  id: string
  cedula: string
  full_name: string | null
  email: string | null
  phone: string | null
  fb_profile_url: string | null
  business_profiles: (RawBusinessProfile & { entrepreneur_id?: string }) | (RawBusinessProfile & { entrepreneur_id?: string })[] | null
  memberships: {
    status: 'active' | 'inactive'
    start_at: string | null
    end_at: string | null
  } | {
    status: 'active' | 'inactive'
    start_at: string | null
    end_at: string | null
  }[] | null
}

export async function getAdminProfiles(search?: string): Promise<AdminProfile[]> {
  let query = supabaseAdmin
    .from('entrepreneurs')
    .select(`
      id, cedula, full_name, email, phone, fb_profile_url,
      business_profiles ( id, business_name, category, description,
        business_phone, instagram_handle, website_url, other_socials,
        directory_image_path, offers_discount, discount_details ),
      memberships ( status, start_at, end_at )
    `)
    .order('full_name', { ascending: true })

  if (search) {
    query = query.ilike('full_name', `%${search}%`)
  }

  const { data: rows, error } = await query.returns<RawProfileRow[]>()
  if (error) throw new Error(error.message)
  if (!rows || rows.length === 0) return []

  // Obtener la application más reciente por entrepreneur
  const entrepreneurIds = rows.map((r) => r.id)
  const { data: latestApps, error: appsError } = await supabaseAdmin
    .from('applications')
    .select('entrepreneur_id, status, submitted_at')
    .in('entrepreneur_id', entrepreneurIds)
    .order('submitted_at', { ascending: false })
    .returns<{ entrepreneur_id: string; status: 'pendiente' | 'aprobado' | 'rechazado'; submitted_at: string }[]>()

  if (appsError) throw new Error(appsError.message)

  // Mapa: entrepreneur_id → status de la aplicación más reciente
  const appStatusMap = new Map<string, 'pendiente' | 'aprobado' | 'rechazado'>()
  for (const a of latestApps ?? []) {
    if (!appStatusMap.has(a.entrepreneur_id)) {
      appStatusMap.set(a.entrepreneur_id, a.status)
    }
  }

  // Si se busca también por business_name, filtrar en JS
  const filtered = search
    ? rows.filter((r) => {
        const bp = one(r.business_profiles)
        const nameMatch = r.full_name?.toLowerCase().includes(search.toLowerCase())
        const bizMatch = bp?.business_name?.toLowerCase().includes(search.toLowerCase())
        return nameMatch || bizMatch
      })
    : rows

  return filtered.map((r): AdminProfile => {
    const bp = one(r.business_profiles)
    const mem = one(r.memberships)

    return {
      entrepreneur_id: r.id,
      cedula: r.cedula,
      full_name: r.full_name,
      email: r.email,
      phone: r.phone,
      fb_profile_url: r.fb_profile_url,
      business_name: bp?.business_name ?? null,
      category: bp?.category ?? null,
      description: bp?.description ?? null,
      business_phone: bp?.business_phone ?? null,
      instagram_handle: bp?.instagram_handle ?? null,
      website_url: bp?.website_url ?? null,
      other_socials: (bp as (RawBusinessProfile & { other_socials?: string | null }) | null)?.other_socials ?? null,
      directory_image_path: bp?.directory_image_path ?? null,
      offers_discount: bp?.offers_discount ?? false,
      discount_details: bp?.discount_details ?? null,
      membership_status: mem?.status ?? null,
      membership_start: mem?.start_at ?? null,
      membership_end: mem?.end_at ?? null,
      application_status: appStatusMap.get(r.id) ?? null,
    }
  })
}

// ---------------------------------------------------------------------------
// 6. getAdminProfileById
// ---------------------------------------------------------------------------

export async function getAdminProfileById(entrepreneurId: string): Promise<AdminProfile | null> {
  const { data: row, error } = await supabaseAdmin
    .from('entrepreneurs')
    .select(`
      id, cedula, full_name, email, phone, fb_profile_url,
      business_profiles ( id, business_name, category, description,
        business_phone, instagram_handle, website_url, other_socials,
        directory_image_path, offers_discount, discount_details ),
      memberships ( status, start_at, end_at )
    `)
    .eq('id', entrepreneurId)
    .single<RawProfileRow>()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }
  if (!row) return null

  const { data: latestApp, error: appError } = await supabaseAdmin
    .from('applications')
    .select('status')
    .eq('entrepreneur_id', entrepreneurId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .single<{ status: 'pendiente' | 'aprobado' | 'rechazado' }>()

  if (appError && appError.code !== 'PGRST116') throw new Error(appError.message)

  const bp = one(row.business_profiles)
  const mem = one(row.memberships)

  return {
    entrepreneur_id: row.id,
    cedula: row.cedula,
    full_name: row.full_name,
    email: row.email,
    phone: row.phone,
    fb_profile_url: row.fb_profile_url,
    business_name: bp?.business_name ?? null,
    category: bp?.category ?? null,
    description: bp?.description ?? null,
    business_phone: bp?.business_phone ?? null,
    instagram_handle: bp?.instagram_handle ?? null,
    website_url: bp?.website_url ?? null,
    other_socials: (bp as (RawBusinessProfile & { other_socials?: string | null }) | null)?.other_socials ?? null,
    directory_image_path: bp?.directory_image_path ?? null,
    offers_discount: bp?.offers_discount ?? false,
    discount_details: bp?.discount_details ?? null,
    membership_status: mem?.status ?? null,
    membership_start: mem?.start_at ?? null,
    membership_end: mem?.end_at ?? null,
    application_status: latestApp?.status ?? null,
  }
}

// ---------------------------------------------------------------------------
// 7. updateProfile
// ---------------------------------------------------------------------------

const ENTREPRENEUR_FIELDS = new Set([
  'full_name', 'email', 'phone', 'fb_profile_url',
])

const BUSINESS_PROFILE_FIELDS = new Set([
  'business_name', 'category', 'description', 'business_phone',
  'instagram_handle', 'website_url', 'other_socials',
  'directory_image_path', 'offers_discount', 'discount_details',
])

type UpdateProfileData = {
  full_name?: string
  email?: string
  phone?: string
  fb_profile_url?: string
  business_name?: string
  category?: string
  description?: string
  business_phone?: string
  instagram_handle?: string
  website_url?: string
  other_socials?: string
  directory_image_path?: string
  offers_discount?: boolean
  discount_details?: string
}

export async function updateProfile(
  entrepreneurId: string,
  data: UpdateProfileData
): Promise<void> {
  const entrepreneurData: Record<string, unknown> = {}
  const businessData: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue
    if (ENTREPRENEUR_FIELDS.has(key)) {
      entrepreneurData[key] = value
    } else if (BUSINESS_PROFILE_FIELDS.has(key)) {
      businessData[key] = value
    }
  }

  if (Object.keys(entrepreneurData).length > 0) {
    const { error } = await supabaseAdmin
      .from('entrepreneurs')
      .update(entrepreneurData)
      .eq('id', entrepreneurId)

    if (error) throw new Error(`Error al actualizar emprendedora: ${error.message}`)
  }

  if (Object.keys(businessData).length > 0) {
    const { error } = await supabaseAdmin
      .from('business_profiles')
      .update(businessData)
      .eq('entrepreneur_id', entrepreneurId)

    if (error) throw new Error(`Error al actualizar perfil de negocio: ${error.message}`)
  }
}

// ---------------------------------------------------------------------------
// 8. getMembershipAlerts
// ---------------------------------------------------------------------------

export async function getMembershipAlerts(): Promise<MembershipAlert[]> {
  const sevenDaysFromNow = addDays(7)

  const { data, error } = await supabaseAdmin
    .from('memberships')
    .select(`
      entrepreneur_id, end_at,
      entrepreneurs ( full_name ),
      business_profiles:entrepreneurs!inner (
        business_profiles ( business_name )
      )
    `)
    .eq('status', 'active')
    .lt('end_at', sevenDaysFromNow)
    .returns<{
      entrepreneur_id: string
      end_at: string
      entrepreneurs: { full_name: string | null } | { full_name: string | null }[] | null
      business_profiles: { business_profiles: { business_name: string | null } | { business_name: string | null }[] | null } | { business_profiles: { business_name: string | null } | { business_name: string | null }[] | null }[] | null
    }[]>()

  if (error) {
    // El join indirecto puede fallar — fallback con dos queries separadas
    return getMembershipAlertsFallback(sevenDaysFromNow)
  }

  if (!data || data.length === 0) return []

  return buildAlerts(data)
}

// Fallback: si el join indirecto no funciona, usar dos queries + JS merge
async function getMembershipAlertsFallback(sevenDaysFromNow: string): Promise<MembershipAlert[]> {
  const { data: mems, error: memError } = await supabaseAdmin
    .from('memberships')
    .select('entrepreneur_id, end_at')
    .eq('status', 'active')
    .lt('end_at', sevenDaysFromNow)
    .returns<{ entrepreneur_id: string; end_at: string }[]>()

  if (memError) throw new Error(memError.message)
  if (!mems || mems.length === 0) return []

  const ids = mems.map((m) => m.entrepreneur_id)

  const { data: entrepreneurs, error: entError } = await supabaseAdmin
    .from('entrepreneurs')
    .select('id, full_name')
    .in('id', ids)
    .returns<{ id: string; full_name: string | null }[]>()

  if (entError) throw new Error(entError.message)

  const { data: profiles, error: profError } = await supabaseAdmin
    .from('business_profiles')
    .select('entrepreneur_id, business_name')
    .in('entrepreneur_id', ids)
    .returns<{ entrepreneur_id: string; business_name: string | null }[]>()

  if (profError) throw new Error(profError.message)

  const entMap = new Map((entrepreneurs ?? []).map((e) => [e.id, e.full_name]))
  const profMap = new Map((profiles ?? []).map((p) => [p.entrepreneur_id, p.business_name]))

  const alerts: MembershipAlert[] = mems.map((m) => ({
    entrepreneur_id: m.entrepreneur_id,
    full_name: entMap.get(m.entrepreneur_id) ?? null,
    business_name: profMap.get(m.entrepreneur_id) ?? null,
    membership_end: m.end_at,
    days_remaining: Math.floor(
      (new Date(m.end_at).getTime() - Date.now()) / 86_400_000
    ),
  }))

  return alerts.sort((a, b) => a.days_remaining - b.days_remaining)
}

// Helper para construir alertas desde la respuesta del join principal
function buildAlerts(
  data: {
    entrepreneur_id: string
    end_at: string
    entrepreneurs: { full_name: string | null } | { full_name: string | null }[] | null
    business_profiles: unknown
  }[]
): MembershipAlert[] {
  const alerts: MembershipAlert[] = data.map((row) => {
    const ent = one(row.entrepreneurs)

    // business_name es doble-nested cuando viene del join indirecto
    let businessName: string | null = null
    const bpOuter = one(row.business_profiles as { business_profiles: unknown } | { business_profiles: unknown }[] | null)
    if (bpOuter) {
      const bpInner = one((bpOuter as { business_profiles: { business_name: string | null } | { business_name: string | null }[] | null }).business_profiles)
      businessName = bpInner?.business_name ?? null
    }

    return {
      entrepreneur_id: row.entrepreneur_id,
      full_name: ent?.full_name ?? null,
      business_name: businessName,
      membership_end: row.end_at,
      days_remaining: Math.floor(
        (new Date(row.end_at).getTime() - Date.now()) / 86_400_000
      ),
    }
  })

  return alerts.sort((a, b) => a.days_remaining - b.days_remaining)
}

// ---------------------------------------------------------------------------
// 9. toggleMembership
// ---------------------------------------------------------------------------

export async function toggleMembership(
  entrepreneurId: string,
  newStatus: 'active' | 'inactive'
): Promise<void> {
  const update: Record<string, unknown> = { status: newStatus }

  if (newStatus === 'inactive') {
    update.end_at = new Date().toISOString()
  }

  const { error } = await supabaseAdmin
    .from('memberships')
    .update(update)
    .eq('entrepreneur_id', entrepreneurId)

  if (error) throw new Error(`Error al cambiar membresía: ${error.message}`)
}
