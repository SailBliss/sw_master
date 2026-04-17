import { supabaseAdmin } from '@src/shared/lib/supabase-admin'

export type LedgerEntry = {
  id: string
  type: 'ingreso' | 'egreso'
  amount_cop: number
  description: string | null
  created_at: string
}

export async function getLedger(): Promise<LedgerEntry[]> {
  const { data, error } = await supabaseAdmin
    .from('ledger_entries')
    .select('id, type, amount_cop, description, created_at')
    .order('created_at', { ascending: false })
    .returns<LedgerEntry[]>()

  if (error) throw new Error(`Error al obtener ledger: ${error.message}`)
  return data ?? []
}

export async function addEntry(entry: Omit<LedgerEntry, 'id' | 'created_at'>): Promise<void> {
  const { error } = await supabaseAdmin
    .from('ledger_entries')
    .insert(entry)

  if (error) throw new Error(`Error al insertar entrada: ${error.message}`)
}
