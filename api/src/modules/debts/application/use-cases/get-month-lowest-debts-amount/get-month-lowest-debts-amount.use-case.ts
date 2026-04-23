import type {
  CardAmountRow,
  IDebtsRepository,
} from '@/modules/debts/domain/repositories/debts.repository.interface'

export class GetMonthLowestDebtsAmountUseCase {
  constructor(private readonly repo: IDebtsRepository) {}

  async execute(
    userId: string,
    month: number,
    year: number,
  ): Promise<{ amount: number; cards: CardAmountRow[] }> {
    const cardTotals = await this.repo.getMonthCardAmounts(userId, month, year)
    const lowestAmount = cardTotals.length ? Math.min(...cardTotals.map(c => c.total)) : 0
    return {
      amount: lowestAmount,
      cards: lowestAmount > 0 ? cardTotals.filter(c => c.total === lowestAmount) : [],
    }
  }
}
