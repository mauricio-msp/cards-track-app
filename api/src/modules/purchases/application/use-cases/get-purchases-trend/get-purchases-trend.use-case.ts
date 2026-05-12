import type { IPurchasesRepository } from '@/modules/purchases/domain/repositories/purchases.repository.interface'

export class GetPurchasesTrendUseCase {
  constructor(private readonly repo: IPurchasesRepository) {}

  async execute(userId: string, year: number): Promise<Record<string, number | string>[]> {
    const rows = await this.repo.getPurchasesTrend(userId, year)
    const uniqueCardNames = [...new Set(rows.map(r => r.cardName.toLowerCase()))]
    const monthMap = new Map<number, Record<string, number | string>>()

    for (let i = 0; i < 12; i++) {
      const entry: Record<string, number | string> = {
        date: `${year}-${String(i + 1).padStart(2, '0')}`,
      }
      for (const name of uniqueCardNames) entry[name] = 0
      monthMap.set(i, entry)
    }

    for (const row of rows) {
      const entry = monthMap.get(row.month)
      if (entry) entry[row.cardName.toLowerCase()] = row.total
    }

    return Array.from(monthMap.values())
  }
}
