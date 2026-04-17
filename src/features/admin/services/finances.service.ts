import {
  getLedger,
  addEntry,
  deleteEntry,
  getAccountSettings,
  type LedgerEntry,
  type AccountSettings,
} from '../repository/finances.repository'

export type FinancesSummary = {
  openingBalance: number
  openingDate: string
  totalIngresos: number
  totalEgresos: number
  balance: number
}

export type MonthlyGroup = {
  month: string   // "YYYY-MM"
  label: string   // "Enero 2025"
  ingresos: number
  egresos: number
  entries: LedgerEntry[]
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export const financesService = {
  async getLedger(): Promise<LedgerEntry[]> {
    return getLedger()
  },

  async addEntry(entry: Omit<LedgerEntry, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    return addEntry(entry)
  },

  async deleteEntry(id: string): Promise<void> {
    return deleteEntry(id)
  },

  async getAccountSettings(): Promise<AccountSettings> {
    return getAccountSettings()
  },

  async getFullSummary(): Promise<FinancesSummary> {
    const [entries, settings] = await Promise.all([getLedger(), getAccountSettings()])
    const totalIngresos = entries
      .filter((e) => e.direction === 'income')
      .reduce((sum, e) => sum + e.amount_cop, 0)
    const totalEgresos = entries
      .filter((e) => e.direction === 'expense')
      .reduce((sum, e) => sum + e.amount_cop, 0)
    return {
      openingBalance: settings.opening_balance_cop,
      openingDate: settings.opening_date,
      totalIngresos,
      totalEgresos,
      balance: settings.opening_balance_cop + totalIngresos - totalEgresos,
    }
  },

  async getMonthlyGroups(): Promise<MonthlyGroup[]> {
    const entries = await getLedger()
    const map = new Map<string, MonthlyGroup>()

    for (const entry of entries) {
      const d = new Date(entry.entry_date + 'T12:00:00') // mediodía para evitar desfase UTC
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!map.has(month)) {
        map.set(month, {
          month,
          label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
          ingresos: 0,
          egresos: 0,
          entries: [],
        })
      }
      const group = map.get(month)!
      group.entries.push(entry)
      if (entry.direction === 'income') group.ingresos += entry.amount_cop
      else group.egresos += entry.amount_cop
    }

    return Array.from(map.values()).sort((a, b) => b.month.localeCompare(a.month))
  },
}
