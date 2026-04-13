import Link from 'next/link'
import { getAdminApplications } from '@/lib/admin-data'
import type { AdminApplication } from '@/lib/types'

type StatusFilter = 'pendiente' | 'aprobado' | 'rechazado'

function isValidStatus(s: string | undefined): s is StatusFilter {
  return s === 'pendiente' || s === 'aprobado' || s === 'rechazado'
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

const STATUS_LABELS: Record<StatusFilter, string> = {
  pendiente: 'Pendiente',
  aprobado: 'Aprobada',
  rechazado: 'Rechazada',
}

const STATUS_BADGE: Record<StatusFilter, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  aprobado: 'bg-green-100 text-green-800',
  rechazado: 'bg-red-100 text-red-800',
}

function StatusBadge({ status }: { status: StatusFilter }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

export default async function AdminSolicitudesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const rawStatus = params.status
  const activeFilter = isValidStatus(rawStatus) ? rawStatus : undefined

  const [allSolicitudes, pendientesSolicitudes] = await Promise.all([
    getAdminApplications(activeFilter),
    getAdminApplications('pendiente'),
  ])

  const solicitudes = allSolicitudes
  const pendientesCount = pendientesSolicitudes.length

  const tabs: { label: string; href: string; value: string | undefined }[] = [
    { label: 'Todas', href: '/admin/solicitudes', value: undefined },
    { label: 'Pendientes', href: '/admin/solicitudes?status=pendiente', value: 'pendiente' },
    { label: 'Aprobadas', href: '/admin/solicitudes?status=aprobado', value: 'aprobado' },
    { label: 'Rechazadas', href: '/admin/solicitudes?status=rechazado', value: 'rechazado' },
  ]

  const emptyMessages: Record<string, string> = {
    pendiente: 'No hay solicitudes pendientes de revisión.',
    aprobado: 'No hay solicitudes aprobadas.',
    rechazado: 'No hay solicitudes rechazadas.',
    all: 'No hay solicitudes registradas.',
  }
  const emptyMsg = emptyMessages[activeFilter ?? 'all']

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Solicitudes</h1>

      {/* Tabs de filtro */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => {
          const isActive = tab.value === activeFilter
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`flex items-center gap-1.5 pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-pink-500 text-pink-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.value === 'pendiente' && pendientesCount > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 min-w-[1.25rem]">
                  {pendientesCount}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Tabla */}
      {solicitudes.length === 0 ? (
        <div className="py-16 text-center text-gray-500 text-sm">{emptyMsg}</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Empresaria</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Negocio</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Categoría</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Enviada</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Estado</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {solicitudes.map((s: AdminApplication) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {s.entrepreneur.full_name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {s.business_profile.business_name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {s.business_profile.category ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(s.submitted_at)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/solicitudes/${s.id}`}
                      className="text-pink-500 hover:text-pink-700 font-medium"
                    >
                      Ver detalle →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
