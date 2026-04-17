// app/admin/(panel)/page.tsx
// Dashboard del panel de administración. Muestra métricas clave y accesos rápidos.

import Link from 'next/link'
import { applicationsService } from '@src/features/admin/services/applications.service'
import { adminProfilesService } from '@src/features/admin/services/profiles.admin.service'
import { membershipsService } from '@src/features/admin/services/memberships.service'

export default async function AdminDashboardPage() {
  const [pending, all, profiles, alerts] = await Promise.all([
    applicationsService.list('pendiente'),
    applicationsService.list(),
    adminProfilesService.list(),
    membershipsService.getAlerts(),
  ])

  const pendingCount = pending.length
  const totalProfiles = profiles.length
  const activeProfiles = profiles.filter((p) => p.membership_status === 'active').length
  const alertCount = alerts.length

  const today = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-8">
      {/* ------------------------------------------------------------------ */}
      {/* Banner de solicitudes pendientes                                    */}
      {/* ------------------------------------------------------------------ */}
      {pendingCount > 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-5 py-4 flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-amber-800">
            Tienes {pendingCount} solicitud{pendingCount !== 1 ? 'es' : ''} pendiente
            {pendingCount !== 1 ? 's' : ''} de revisión
          </p>
          <Link
            href="/admin/solicitudes?status=pendiente"
            className="shrink-0 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition-colors"
          >
            Revisar ahora
          </Link>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Encabezado                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de administración</h1>
        <p className="mt-1 text-sm text-gray-500 capitalize">{today}</p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Grid de métricas                                                    */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Solicitudes pendientes */}
        <Link
          href="/admin/solicitudes?status=pendiente"
          className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Solicitudes pendientes
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
            {pendingCount}
          </p>
          <p className="mt-1 text-xs text-gray-400">{all.length} en total</p>
        </Link>

        {/* Total de perfiles */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Perfiles registrados
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalProfiles}</p>
          <p className="mt-1 text-xs text-gray-400">todas las empresarias</p>
        </div>

        {/* Perfiles activos */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Activos en directorio
          </p>
          <p className="mt-2 text-3xl font-bold text-green-600">{activeProfiles}</p>
          <p className="mt-1 text-xs text-gray-400">membresía vigente</p>
        </div>

        {/* Alertas */}
        <Link
          href="/admin/membresias"
          className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Alertas de membresía
          </p>
          <p className={`mt-2 text-3xl font-bold transition-colors ${alertCount > 0 ? 'text-red-600' : 'text-gray-900 group-hover:text-indigo-600'}`}>
            {alertCount}
          </p>
          <p className="mt-1 text-xs text-gray-400">vencidas o por vencer</p>
        </Link>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Accesos rápidos                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Accesos rápidos</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/admin/solicitudes?status=pendiente"
            className="group flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-lg">
              📋
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">
                Revisar solicitudes pendientes
              </p>
              <p className="text-xs text-gray-500">{pendingCount} en espera</p>
            </div>
          </Link>

          <Link
            href="/admin/membresias"
            className="group flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 text-lg">
              ⚠️
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">
                Ver alertas de membresía
              </p>
              <p className="text-xs text-gray-500">{alertCount} alerta{alertCount !== 1 ? 's' : ''}</p>
            </div>
          </Link>

          <Link
            href="/admin/perfiles"
            className="group flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-lg">
              👥
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">
                Ver todos los perfiles
              </p>
              <p className="text-xs text-gray-500">{totalProfiles} registradas</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
