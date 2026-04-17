// Ruta API para el módulo de finanzas.
// GET: devuelve el ledger completo + resumen con saldo inicial.
// POST: inserta una nueva entrada (ingreso o egreso) al ledger.
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession, SESSION_COOKIE_NAME } from '@src/shared/lib/auth'
import { financesService } from '@src/features/admin/services/finances.service'
import type { LedgerEntry } from '@src/features/admin/repository/finances.repository'

async function requireAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!token) return false
  const email = await verifySession(token)
  return email !== null
}

export async function GET(_req: NextRequest): Promise<NextResponse> {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const [ledger, summary, monthlyGroups] = await Promise.all([
      financesService.getLedger(),
      financesService.getFullSummary(),
      financesService.getMonthlyGroups(),
    ])
    return NextResponse.json({ ledger, summary, monthlyGroups })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { type, amount_cop, description } = body as Partial<LedgerEntry>

  if (type !== 'ingreso' && type !== 'egreso') {
    return NextResponse.json({ error: 'type debe ser ingreso o egreso' }, { status: 400 })
  }
  if (!amount_cop || typeof amount_cop !== 'number' || amount_cop <= 0) {
    return NextResponse.json({ error: 'amount_cop debe ser un número mayor a 0' }, { status: 400 })
  }

  try {
    await financesService.addEntry({ type, amount_cop, description: description ?? null })
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
