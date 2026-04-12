'use server'

import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Image from 'next/image'
import { getAdminProfileById, updateProfile, toggleMembership } from '@/lib/admin-data'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { CATEGORIES } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

function daysRemaining(isoEnd: string): number {
  return Math.floor((new Date(isoEnd).getTime() - Date.now()) / 86_400_000)
}

/** Extracts a bare instagram handle from any input format. */
function cleanInstagramHandle(raw: string): string {
  let handle = raw.trim()
  // Remove leading @ if present
  if (handle.startsWith('@')) handle = handle.slice(1)
  // If it looks like a URL, extract the last path segment
  if (handle.startsWith('http') || handle.startsWith('www.')) {
    try {
      const url = new URL(handle.startsWith('www.') ? `https://${handle}` : handle)
      // pathname is like /minegocio or /minegocio/ — grab the last non-empty segment
      const segments = url.pathname.split('/').filter(Boolean)
      handle = segments[segments.length - 1] ?? handle
    } catch {
      // Not a valid URL — fall through and use as-is
    }
  }
  return handle
}

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

async function updateProfileAction(formData: FormData) {
  'use server'
  const entrepreneurId = formData.get('entrepreneur_id') as string

  // --- Personal data ---
  const full_name = (formData.get('full_name') as string | null) ?? undefined
  const email = (formData.get('email') as string | null) ?? undefined
  const phone = (formData.get('phone') as string | null) ?? undefined
  const fb_profile_url = (formData.get('fb_profile_url') as string | null) ?? undefined

  // --- Business data ---
  const business_name = (formData.get('business_name') as string | null) ?? undefined
  const category = (formData.get('category') as string | null) ?? undefined
  const description = (formData.get('description') as string | null) ?? undefined
  const business_phone = (formData.get('business_phone') as string | null) ?? undefined
  const rawInstagram = (formData.get('instagram_handle') as string | null) ?? ''
  const instagram_handle = rawInstagram ? cleanInstagramHandle(rawInstagram) : undefined
  const website_url = (formData.get('website_url') as string | null) ?? undefined
  const other_socials = (formData.get('other_socials') as string | null) ?? undefined
  const offers_discount = formData.get('offers_discount') === 'on'
  const discount_details = offers_discount
    ? ((formData.get('discount_details') as string | null) ?? undefined)
    : ''

  // --- Image upload ---
  let directory_image_path: string | undefined = undefined
  const imageFile = formData.get('directory_image') as File | null
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop() ?? 'jpg'
    const path = `${entrepreneurId}/${Date.now()}.${ext}`
    const arrayBuffer = await imageFile.arrayBuffer()
    const { error: uploadError } = await supabaseAdmin.storage
      .from('business-images')
      .upload(path, arrayBuffer, {
        contentType: imageFile.type,
        upsert: false,
      })
    if (uploadError) throw new Error(`Error al subir imagen: ${uploadError.message}`)
    directory_image_path = path
  }

  await updateProfile(entrepreneurId, {
    full_name,
    email,
    phone,
    fb_profile_url,
    business_name,
    category,
    description,
    business_phone,
    instagram_handle,
    website_url,
    other_socials,
    offers_discount,
    discount_details,
    ...(directory_image_path ? { directory_image_path } : {}),
  })

  revalidatePath('/admin/perfiles')
  revalidatePath('/directorio')
  redirect(`/admin/perfiles/${entrepreneurId}`)
}

async function toggleMembershipAction(formData: FormData) {
  'use server'
  const entrepreneurId = formData.get('entrepreneur_id') as string
  const newStatus = formData.get('new_status') as 'active' | 'inactive'

  await toggleMembership(entrepreneurId, newStatus)

  revalidatePath('/admin/perfiles')
  revalidatePath('/directorio')
  redirect(`/admin/perfiles/${entrepreneurId}`)
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function AdminPerfilDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await getAdminProfileById(id)
  if (!profile) notFound()

  // Resolve image URL if exists
  let imageUrl: string | null = null
  if (profile.directory_image_path) {
    const { data } = supabaseAdmin.storage
      .from('business-images')
      .getPublicUrl(profile.directory_image_path)
    imageUrl = data.publicUrl
  }

  const initials = profile.business_name
    ? profile.business_name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : '?'

  const memDays = profile.membership_end ? daysRemaining(profile.membership_end) : null
  const isActive = profile.membership_status === 'active'

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <a href="/admin/perfiles" className="text-sm text-gray-500 hover:text-gray-700">
          ← Perfiles
        </a>
        <h1 className="text-2xl font-semibold text-gray-900">
          {profile.business_name ?? profile.full_name ?? 'Sin nombre'}
        </h1>
      </div>

      <form action={updateProfileAction} encType="multipart/form-data" className="space-y-8">
        <input type="hidden" name="entrepreneur_id" value={profile.entrepreneur_id} />

        {/* ------------------------------------------------------------------ */}
        {/* Sección 1 — Datos personales                                        */}
        {/* ------------------------------------------------------------------ */}
        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-800">Datos personales</h2>
          </div>
          <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                name="full_name"
                defaultValue={profile.full_name ?? ''}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                defaultValue={profile.email ?? ''}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono personal
              </label>
              <input
                type="text"
                name="phone"
                defaultValue={profile.phone ?? ''}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Perfil de Facebook
              </label>
              <input
                type="text"
                name="fb_profile_url"
                defaultValue={profile.fb_profile_url ?? ''}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Sección 2 — Datos del negocio                                       */}
        {/* ------------------------------------------------------------------ */}
        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-800">Datos del negocio</h2>
          </div>
          <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del negocio
              </label>
              <input
                type="text"
                name="business_name"
                defaultValue={profile.business_name ?? ''}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                name="category"
                defaultValue={profile.category ?? ''}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">Seleccionar…</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción <span className="font-normal text-gray-400">(máx. 300 caracteres)</span>
              </label>
              <textarea
                name="description"
                defaultValue={profile.description ?? ''}
                maxLength={300}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp del negocio
              </label>
              <input
                type="text"
                name="business_phone"
                defaultValue={profile.business_phone ?? ''}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instagram
              </label>
              <input
                type="text"
                name="instagram_handle"
                defaultValue={profile.instagram_handle ?? ''}
                placeholder="minegocio"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sitio web
              </label>
              <input
                type="text"
                name="website_url"
                defaultValue={profile.website_url ?? ''}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Otras redes sociales
              </label>
              <input
                type="text"
                name="other_socials"
                defaultValue={profile.other_socials ?? ''}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div className="sm:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="offers_discount"
                  name="offers_discount"
                  defaultChecked={profile.offers_discount}
                  className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
                <label htmlFor="offers_discount" className="text-sm font-medium text-gray-700">
                  Ofrece descuento a miembros SW
                </label>
              </div>
              {profile.offers_discount && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Detalle del descuento
                  </label>
                  <input
                    type="text"
                    name="discount_details"
                    defaultValue={profile.discount_details ?? ''}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Sección 3 — Imagen del directorio                                   */}
        {/* ------------------------------------------------------------------ */}
        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-800">Imagen del directorio</h2>
          </div>
          <div className="flex items-start gap-6 px-6 py-5">
            {/* Preview */}
            <div className="flex-shrink-0">
              {imageUrl ? (
                <div className="relative h-24 w-24 rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={imageUrl}
                    alt={profile.business_name ?? 'Imagen del negocio'}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              ) : (
                <div className="h-24 w-24 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600 text-2xl font-bold border border-violet-200">
                  {initials}
                </div>
              )}
            </div>
            {/* Upload */}
            <div className="flex-1 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {imageUrl ? 'Reemplazar imagen' : 'Subir imagen'}
              </label>
              <input
                type="file"
                name="directory_image"
                accept="image/*"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
              />
              <p className="text-xs text-gray-400">
                La nueva imagen reemplaza la anterior. Solo imágenes.
              </p>
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
          >
            Guardar cambios
          </button>
        </div>
      </form>

      {/* -------------------------------------------------------------------- */}
      {/* Sección 4 — Membresía (formulario separado para el toggle)            */}
      {/* -------------------------------------------------------------------- */}
      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-800">Membresía</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Estado</p>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {isActive ? 'Activa' : 'Inactiva'}
              </span>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Inicio</p>
              <p className="text-gray-900">
                {profile.membership_start ? formatDate(profile.membership_start) : '—'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Vencimiento</p>
              <p className="text-gray-900">
                {profile.membership_end ? formatDate(profile.membership_end) : '—'}
              </p>
            </div>
          </div>
          {profile.membership_end && (
            <p className="text-sm text-gray-600">
              {memDays !== null && memDays >= 0
                ? `${memDays} día${memDays !== 1 ? 's' : ''} restante${memDays !== 1 ? 's' : ''}`
                : `Venció hace ${Math.abs(memDays ?? 0)} día${Math.abs(memDays ?? 0) !== 1 ? 's' : ''}`}
            </p>
          )}
          <form action={toggleMembershipAction}>
            <input type="hidden" name="entrepreneur_id" value={profile.entrepreneur_id} />
            <input type="hidden" name="new_status" value={isActive ? 'inactive' : 'active'} />
            <button
              type="submit"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                  : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
              }`}
            >
              {isActive ? 'Desactivar membresía' : 'Activar membresía'}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
