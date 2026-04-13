import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getAdminApplicationById, approveApplication, rejectApplication } from '@/lib/admin-data'
import { notifyEntrepreneurApproved, notifyEntrepreneurRejected } from '@/lib/email'
import { supabaseAdmin } from '@/lib/supabase-admin'

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

async function approveApplicationAction(formData: FormData) {
  'use server'
  const applicationId = formData.get('applicationId') as string
  const entrepreneurId = formData.get('entrepreneurId') as string
  const durationDays = Number(formData.get('durationDays') ?? '90')
  const entrepreneurEmail = formData.get('entrepreneurEmail') as string
  const entrepreneurName = formData.get('entrepreneurName') as string
  const businessName = formData.get('businessName') as string

  await approveApplication(applicationId, entrepreneurId, durationDays)
  await notifyEntrepreneurApproved({ to: entrepreneurEmail, entrepreneurName, businessName })
  redirect('/admin/solicitudes')
}

async function rejectApplicationAction(formData: FormData) {
  'use server'
  const applicationId = formData.get('applicationId') as string
  const entrepreneurEmail = formData.get('entrepreneurEmail') as string
  const entrepreneurName = formData.get('entrepreneurName') as string
  const notes = (formData.get('notes') as string | null) || undefined

  await rejectApplication(applicationId, notes)
  await notifyEntrepreneurRejected({ to: entrepreneurEmail, entrepreneurName, notes })
  redirect('/admin/solicitudes')
}

// ---------------------------------------------------------------------------
// Helpers UI
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

const STATUS_BADGE: Record<'pendiente' | 'aprobado' | 'rechazado', string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  aprobado: 'bg-green-100 text-green-800',
  rechazado: 'bg-red-100 text-red-800',
}

const STATUS_LABELS: Record<'pendiente' | 'aprobado' | 'rechazado', string> = {
  pendiente: 'Pendiente',
  aprobado: 'Aprobada',
  rechazado: 'Rechazada',
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value ?? <span className="text-gray-400">—</span>}</dd>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function AdminSolicitudDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const solicitud = await getAdminApplicationById(id)

  if (!solicitud) notFound()

  // Public URLs para los archivos de Storage
  const receiptUrl = supabaseAdmin.storage
    .from('recipts')
    .getPublicUrl(solicitud.receipt_path).data.publicUrl

  const screenshotUrl = solicitud.post_screenshot_path
    ? supabaseAdmin.storage
        .from('post_screenshots')
        .getPublicUrl(solicitud.post_screenshot_path).data.publicUrl
    : null

  const { entrepreneur: ent, business_profile: bp, product, status } = solicitud

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/solicitudes" className="hover:text-gray-700">
          Solicitudes
        </Link>
        <span>→</span>
        <span className="text-gray-900 font-medium">{bp.business_name ?? 'Sin nombre'}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          {bp.business_name ?? 'Sin nombre'}
        </h1>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${STATUS_BADGE[status]}`}>
          {STATUS_LABELS[status]}
        </span>
      </div>

      {/* Datos de la empresaria */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
          Datos de la empresaria
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre completo" value={ent.full_name} />
          <Field label="Cédula" value={ent.cedula} />
          <Field label="Email" value={ent.email} />
          <Field label="Teléfono" value={ent.phone} />
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Perfil de Facebook</dt>
            <dd className="mt-1 text-sm">
              {ent.fb_profile_url ? (
                <a href={ent.fb_profile_url} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:underline break-all">
                  {ent.fb_profile_url}
                </a>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </dd>
          </div>
        </dl>
      </section>

      {/* Datos del negocio */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
          Datos del negocio
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre del negocio" value={bp.business_name} />
          <Field label="Categoría" value={bp.category} />
          <div className="sm:col-span-2">
            <Field label="Descripción" value={bp.description} />
          </div>
          <Field label="WhatsApp" value={bp.business_phone} />
          <Field label="Instagram" value={bp.instagram_handle ? `@${bp.instagram_handle}` : null} />
          {bp.website_url && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sitio web</dt>
              <dd className="mt-1 text-sm">
                <a href={bp.website_url} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:underline break-all">
                  {bp.website_url}
                </a>
              </dd>
            </div>
          )}
          {bp.offers_discount && bp.discount_details && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Descuento especial SW</dt>
              <dd className="mt-1 text-sm text-gray-900">{bp.discount_details}</dd>
            </div>
          )}
        </dl>
      </section>

      {/* Plan y pago */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
          Plan y pago
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Plan" value={product.name} />
          <Field
            label="Monto pagado"
            value={product.price_cop === 0 ? 'Gratuito' : `$${product.price_cop.toLocaleString('es-CO')} COP`}
          />
          <Field label="Enviada el" value={formatDate(solicitud.submitted_at)} />
          {solicitud.reviewed_at && (
            <Field label="Revisada el" value={formatDate(solicitud.reviewed_at)} />
          )}
        </dl>

        {/* Archivos */}
        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href={receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Ver comprobante de pago ↗
          </a>
          {screenshotUrl && (
            <a
              href={screenshotUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Ver captura del post ↗
            </a>
          )}
        </div>
      </section>

      {/* Acciones */}
      {status === 'pendiente' ? (
        <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-6">
          <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Decisión
          </h2>

          {/* Aprobar */}
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Aprobar activa la membresía por {product.duration_days ?? 90} días y notifica a la empresaria por email.
            </p>
            <form action={approveApplicationAction}>
              <input type="hidden" name="applicationId" value={solicitud.id} />
              <input type="hidden" name="entrepreneurId" value={ent.id} />
              <input type="hidden" name="durationDays" value={String(product.duration_days ?? 90)} />
              <input type="hidden" name="entrepreneurEmail" value={ent.email ?? ''} />
              <input type="hidden" name="entrepreneurName" value={ent.full_name ?? ''} />
              <input type="hidden" name="businessName" value={bp.business_name ?? ''} />
              <button
                type="submit"
                className="rounded-md bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
              >
                Aprobar solicitud
              </button>
            </form>
          </div>

          <hr className="border-gray-100" />

          {/* Rechazar */}
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Rechazar desactiva la membresía y notifica a la empresaria por email. La nota es opcional.
            </p>
            <form action={rejectApplicationAction} className="space-y-3">
              <input type="hidden" name="applicationId" value={solicitud.id} />
              <input type="hidden" name="entrepreneurEmail" value={ent.email ?? ''} />
              <input type="hidden" name="entrepreneurName" value={ent.full_name ?? ''} />
              <textarea
                name="notes"
                rows={3}
                placeholder="Nota para la empresaria (opcional)…"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300"
              />
              <button
                type="submit"
                className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Rechazar solicitud
              </button>
            </form>
          </div>
        </section>
      ) : (
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-600">
            Esta solicitud fue{' '}
            <span className={`font-medium ${status === 'aprobado' ? 'text-green-700' : 'text-red-700'}`}>
              {STATUS_LABELS[status].toLowerCase()}
            </span>
            {solicitud.reviewed_at ? ` el ${formatDate(solicitud.reviewed_at)}` : ''}.
          </p>
          {solicitud.notes && (
            <p className="mt-2 text-sm text-gray-600">
              <strong>Nota:</strong> {solicitud.notes}
            </p>
          )}
        </section>
      )}
    </div>
  )
}
