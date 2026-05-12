import type { CardAmountRow, IPurchasesRepository } from '@/modules/purchases/domain/repositories/purchases.repository.interface'

export class GetMonthLowestAmountUseCase {
  constructor(private readonly repo: IPurchasesRepository) {}

  async execute(userId: string): Promise<{ amount: number; cards: CardAmountRow[] }> {
    const now = new Date()
    const rows = await this.repo.getMonthCardAmounts(userId, now.getMonth(), now.getFullYear())
    if (rows.length === 0) return { amount: 0, cards: [] }
    const min = Math.min(...rows.map(r => r.total))
    return { amount: min, cards: rows.filter(r => r.total === min) }
  }
}
