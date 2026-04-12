// app/admin/(panel)/membresias/page.tsx
// Lista de alertas de membresía + tabla completa de todas las membresías.

import Link from 'next/link'
import { getMembershipAlerts, getAdminProfiles } from '@/lib/admin-data'
import type { MembershipAlert, AdminProfile } from '@/lib/types'

// ---------------------------------------------------------------------------
// Helpers de formateo
// ---------------------------------------------------------------------------

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function daysFromNow(iso: string | null): number | null {
  if (!iso) return null
  return Math.floor((new Date(iso).getTime() - Date.now()) / 86_400_000)
}

// ---------------------------------------------------------------------------
// Subcomponente: badge de días (para alertas)
// ---------------------------------------------------------------------------

function DaysBadge({ days }: { days: number }) {
  if (days < 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
        Venció hace {Math.abs(days)} {Math.abs(days) === 1 ? 'día' : 'días'}
      </span>
    )
  }
  if (days === 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
        Vence hoy
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
      Vence en {days} {days === 1 ? 'día' : 'días'}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Subcomponente: badge de status de membresía
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: 'active' | 'inactive' | null }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
        Activa
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
      Inactiva
    </span>
  )
}

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------

export default async function MembresiasPage() {
  const [alerts, profiles] = await Promise.all([
    getMembershipAlerts(),
    getAdminProfiles(),
  ])

  // Activas primero, luego inactivas
  const sorted = [...profiles].sort((a, b) => {
    if (a.membership_status === b.membership_status) return 0
    return a.membership_status === 'active' ? -1 : 1
  })

  return (
    <div className="space-y-10">
      {/* ------------------------------------------------------------------ */}
      {/* SECCIÓN 1 — Alertas                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Alertas de membresía</h2>

        {alerts.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white px-6 py-8 text-center text-sm text-gray-500">
            Sin alertas activas
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {alerts.map((alert: MembershipAlert) => (
              <div
                key={alert.entrepreneur_id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 space-y-0.5">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {alert.full_name ?? '(sin nombre)'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {alert.business_name ?? '(sin negocio)'}
                  </p>
                </div>

                <div className="mb-3">
                  <DaysBadge days={alert.days_remaining} />
                </div>

                <p className="text-xs text-gray-400 mb-3">
                  Vence el {formatDate(alert.membership_end)}
                </p>

                <Link
                  href={`/admin/perfiles/${alert.entrepreneur_id}`}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  Ver perfil →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* SECCIÓN 2 — Tabla de todas las membresías                           */}
      {/* ------------------------------------------------------------------ */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Todas las membresías</h2>

        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Empresaria</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Negocio</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Estado</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Inicio</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Fin</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Días restantes</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map((p: AdminProfile) => {
                const days = daysFromNow(p.membership_end)
                return (
                  <tr key={p.entrepreneur_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                      {p.full_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {p.business_name ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.membership_status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(p.membership_start)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(p.membership_end)}
                    </td>
                    <td className="px-4 py-3">
                      {days !== null ? (
                        <span
                          className={
                            days < 0
                              ? 'text-red-600 font-medium'
                              : days <= 7
                                ? 'text-yellow-600 font-medium'
                                : 'text-gray-600'
                          }
                        >
                          {days < 0 ? `−${Math.abs(days)}` : days}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/perfiles/${p.entrepreneur_id}`}
                        className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                      >
                        Gestionar
                      </Link>
                    </td>
                  </tr>
                )
              })}

              {sorted.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                    No hay membresías registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
