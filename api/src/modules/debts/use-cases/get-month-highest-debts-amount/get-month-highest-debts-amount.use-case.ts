import type { CardAmountRow, IDebtsRepository } from '@/modules/debts/debts.repository.interface'

export class GetMonthHighestDebtsAmountUseCase {
  constructor(private readonly repo: IDebtsRepository) {}

  async execute(userId: string, month: number, year: number): Promise<{ amount: number; cards: CardAmountRow[] }> {
    const cardTotals = await this.repo.getMonthCardAmounts(userId, month, year)
    const highestAmount = cardTotals.length ? Math.max(...cardTotals.map(c => c.total)) : 0
    return {
      amount: highestAmount,
      cards: highestAmount > 0 ? cardTotals.filter(c => c.total === highestAmount) : [],
    }
  }
}
