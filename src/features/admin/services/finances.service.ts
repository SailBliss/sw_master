import { getLedger, addEntry, type LedgerEntry } from '../repository/finances.repository'

export const financesService = {
  async getLedger(): Promise<LedgerEntry[]> {
    return getLedger()
  },

  async addEntry(entry: Omit<LedgerEntry, 'id' | 'created_at'>): Promise<void> {
    return addEntry(entry)
  },

  async getSummary(): Promise<{ totalIngresos: number; totalEgresos: number; balance: number }> {
    const entries = await getLedger()
    const totalIngresos = entries
      .filter((e) => e.type === 'ingreso')
      .reduce((sum, e) => sum + e.amount_cop, 0)
    const totalEgresos = entries
      .filter((e) => e.type === 'egreso')
      .reduce((sum, e) => sum + e.amount_cop, 0)
    return { totalIngresos, totalEgresos, balance: totalIngresos - totalEgresos }
  },
}
