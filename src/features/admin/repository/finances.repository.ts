import { supabaseAdmin } from '@src/shared/lib/supabase-admin'

export type LedgerEntry = {
  id: string
  type: 'ingreso' | 'egreso'
  amount_cop: number
  description: string | null
  created_at: string
}

export type AccountSettings = {
  opening_balance_cop: number
  opening_date: string
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

export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('ledger_entries')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`Error al eliminar entrada: ${error.message}`)
}

export async function getAccountSettings(): Promise<AccountSettings> {
  const { data, error } = await supabaseAdmin
    .from('account_settings')
    .select('opening_balance_cop, opening_date')
    .limit(1)
    .single()

  if (error) throw new Error(`Error al obtener configuración de cuenta: ${error.message}`)
  return data as AccountSettings
}
