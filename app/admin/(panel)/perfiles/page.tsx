import Link from 'next/link'
import { getAdminProfiles } from '@/lib/admin-data'
import type { AdminProfile } from '@/lib/types'

function formatDate(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

type MembershipStatus = 'active' | 'inactive' | null
type AppStatus = 'pendiente' | 'aprobado' | 'rechazado' | null

function MembershipBadge({ status }: { status: MembershipStatus }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
        Activa
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">
      Inactiva
    </span>
  )
}

const APP_STATUS_BADGE: Record<NonNullable<AppStatus>, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  aprobado: 'bg-green-100 text-green-800',
  rechazado: 'bg-red-100 text-red-800',
}
const APP_STATUS_LABEL: Record<NonNullable<AppStatus>, string> = {
  pendiente: 'Pendiente',
  aprobado: 'Aprobada',
  rechazado: 'Rechazada',
}

function AppStatusBadge({ status }: { status: AppStatus }) {
  if (!status) return <span className="text-gray-400 text-xs">—</span>
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${APP_STATUS_BADGE[status]}`}>
      {APP_STATUS_LABEL[status]}
    </span>
  )
}

export default async function AdminPerfilesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const q = params.q?.trim() || undefined

  const perfiles = await getAdminProfiles(q)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Perfiles</h1>

      {/* Búsqueda */}
      <form method="GET" className="flex gap-2 max-w-md">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ''}
          placeholder="Buscar por empresaria o negocio…"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
        >
          Buscar
        </button>
        {q && (
          <a
            href="/admin/perfiles"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Limpiar
          </a>
        )}
      </form>

      {/* Total */}
      <p className="text-sm text-gray-500">
        {perfiles.length === 0
          ? 'Sin resultados'
          : `${perfiles.length} perfil${perfiles.length !== 1 ? 'es' : ''} encontrado${perfiles.length !== 1 ? 's' : ''}`}
        {q && <span className="ml-1">para &ldquo;{q}&rdquo;</span>}
      </p>

      {/* Tabla */}
      {perfiles.length === 0 ? (
        <div className="py-16 text-center text-gray-500 text-sm">
          No se encontraron perfiles{q ? ` con "${q}"` : ''}.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Empresaria</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Negocio</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Categoría</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Membresía</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Vence</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Solicitud</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {perfiles.map((p: AdminProfile) => (
                <tr key={p.entrepreneur_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {p.full_name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {p.business_name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {p.category ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <MembershipBadge status={p.membership_status} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {p.membership_end ? formatDate(p.membership_end) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <AppStatusBadge status={p.application_status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/perfiles/${p.entrepreneur_id}`}
                      className="text-violet-600 hover:text-violet-800 font-medium"
                    >
                      Editar →
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
