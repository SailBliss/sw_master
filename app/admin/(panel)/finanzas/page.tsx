'use client'

// Página de finanzas del panel admin.
// Muestra: 3 tarjetas de resumen (ingresos, egresos, balance),
// formulario para nueva entrada, y el ledger agrupado por mes con opción de eliminar.
// Es Client Component para manejar el formulario y el delete sin recargar la página.

import { useEffect, useState, useCallback } from 'react'

// ─── Tipos locales ────────────────────────────────────────────────────────────

type LedgerEntry = {
  id: string
  type: 'ingreso' | 'egreso'
  amount_cop: number
  description: string | null
  created_at: string
}

type FinancesSummary = {
  openingBalance: number
  openingDate: string
  totalIngresos: number
  totalEgresos: number
  balance: number
}

type MonthlyGroup = {
  month: string
  label: string
  ingresos: number
  egresos: number
  entries: LedgerEntry[]
}

type FinancesData = {
  ledger: LedgerEntry[]
  summary: FinancesSummary
  monthlyGroups: MonthlyGroup[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// ─── Componente de tarjeta de resumen ────────────────────────────────────────

function SummaryCard({
  label,
  amount,
  color,
  sub,
}: {
  label: string
  amount: number
  color: 'green' | 'red' | 'blue'
  sub?: string
}) {
  const colorMap = {
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
  }
  return (
    <div className={`rounded-xl border p-5 ${colorMap[color]}`}>
      <p className="text-sm font-medium opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-bold">{formatCOP(amount)}</p>
      {sub && <p className="mt-1 text-xs opacity-60">{sub}</p>}
    </div>
  )
}

// ─── Formulario de nueva entrada ─────────────────────────────────────────────

function NewEntryForm({ onSuccess }: { onSuccess: () => void }) {
  const [type, setType] = useState<'ingreso' | 'egreso'>('ingreso')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const parsed = parseFloat(amount.replace(/\./g, '').replace(',', '.'))
    if (!parsed || parsed <= 0) {
      setError('Ingresa un monto válido mayor a 0')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/finanzas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, amount_cop: parsed, description: description || null }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Error al guardar')
        return
      }
      setAmount('')
      setDescription('')
      onSuccess()
    } catch {
      setError('Error de red. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-base font-semibold text-gray-800">Nueva entrada</h2>

      <div className="grid gap-4 sm:grid-cols-3">
        {/* Tipo */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Tipo</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'ingreso' | 'egreso')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="ingreso">Ingreso</option>
            <option value="egreso">Egreso</option>
          </select>
        </div>

        {/* Monto */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Monto (COP)</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Ej: 50000"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Descripción</label>
          <input
            type="text"
            placeholder="Opcional"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar entrada'}
        </button>
      </div>
    </form>
  )
}

// ─── Fila del ledger ──────────────────────────────────────────────────────────

function EntryRow({
  entry,
  onDelete,
}: {
  entry: LedgerEntry
  onDelete: (id: string) => void
}) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/finanzas/${entry.id}`, { method: 'DELETE' })
      if (res.ok) onDelete(entry.id)
    } finally {
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <tr className="border-b border-gray-100 text-sm hover:bg-gray-50">
      <td className="py-3 pr-4 text-gray-500">{formatDate(entry.created_at)}</td>
      <td className="py-3 pr-4">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            entry.type === 'ingreso'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {entry.type === 'ingreso' ? '▲ Ingreso' : '▼ Egreso'}
        </span>
      </td>
      <td className="py-3 pr-4 text-gray-700">{entry.description ?? '—'}</td>
      <td
        className={`py-3 pr-4 text-right font-medium tabular-nums ${
          entry.type === 'ingreso' ? 'text-green-700' : 'text-red-600'
        }`}
      >
        {entry.type === 'ingreso' ? '+' : '-'} {formatCOP(entry.amount_cop)}
      </td>
      <td className="py-3 text-right">
        {confirming ? (
          <span className="inline-flex gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs text-red-600 hover:underline disabled:opacity-50"
            >
              {deleting ? 'Eliminando…' : 'Confirmar'}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="text-xs text-gray-400 hover:underline"
            >
              Cancelar
            </button>
          </span>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="text-xs text-gray-400 hover:text-red-500"
          >
            Eliminar
          </button>
        )}
      </td>
    </tr>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function AdminFinanzasPage() {
  const [data, setData] = useState<FinancesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/finanzas')
      if (!res.ok) throw new Error('Error al cargar datos')
      const json = await res.json()
      setData(json as FinancesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function handleEntryDeleted(id: string) {
    if (!data) return
    const updatedLedger = data.ledger.filter((e) => e.id !== id)
    // Recalcular resumen localmente para respuesta inmediata
    const totalIngresos = updatedLedger
      .filter((e) => e.type === 'ingreso')
      .reduce((s, e) => s + e.amount_cop, 0)
    const totalEgresos = updatedLedger
      .filter((e) => e.type === 'egreso')
      .reduce((s, e) => s + e.amount_cop, 0)
    setData({
      ...data,
      ledger: updatedLedger,
      summary: {
        ...data.summary,
        totalIngresos,
        totalEgresos,
        balance: data.summary.openingBalance + totalIngresos - totalEgresos,
      },
      monthlyGroups: data.monthlyGroups.map((g) => ({
        ...g,
        entries: g.entries.filter((e) => e.id !== id),
      })).filter((g) => g.entries.length > 0),
    })
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400 text-sm">
        Cargando finanzas…
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 text-sm">
        {error ?? 'No se pudieron cargar los datos.'}
      </div>
    )
  }

  const { summary, monthlyGroups } = data

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-gray-900">Finanzas</h1>

      {/* ── Tarjetas de resumen ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total ingresos"
          amount={summary.totalIngresos}
          color="green"
        />
        <SummaryCard
          label="Total egresos"
          amount={summary.totalEgresos}
          color="red"
        />
        <SummaryCard
          label="Balance actual"
          amount={summary.balance}
          color="blue"
          sub={`Saldo inicial: ${formatCOP(summary.openingBalance)} · desde ${formatDate(summary.openingDate)}`}
        />
      </div>

      {/* ── Formulario ── */}
      <NewEntryForm onSuccess={fetchData} />

      {/* ── Ledger por mes ── */}
      {monthlyGroups.length === 0 ? (
        <p className="text-sm text-gray-500">No hay entradas registradas aún.</p>
      ) : (
        monthlyGroups.map((group) => (
          <div key={group.month} className="rounded-xl border border-gray-200 bg-white">
            {/* Cabecera del mes */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
              <span className="font-semibold text-gray-800">{group.label}</span>
              <span className="text-sm text-gray-500">
                <span className="text-green-600 font-medium">+{formatCOP(group.ingresos)}</span>
                {' · '}
                <span className="text-red-500 font-medium">−{formatCOP(group.egresos)}</span>
              </span>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto px-5">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                    <th className="pb-2 pt-4 pr-4">Fecha</th>
                    <th className="pb-2 pt-4 pr-4">Tipo</th>
                    <th className="pb-2 pt-4 pr-4">Descripción</th>
                    <th className="pb-2 pt-4 pr-4 text-right">Monto</th>
                    <th className="pb-2 pt-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {group.entries.map((entry) => (
                    <EntryRow
                      key={entry.id}
                      entry={entry}
                      onDelete={handleEntryDeleted}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="h-3" />
          </div>
        ))
      )}
    </div>
  )
}
