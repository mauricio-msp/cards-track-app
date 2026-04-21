import { CardNotFoundError } from '@/modules/cards/cards.errors'
import type { ICardsRepository } from '@/modules/cards/cards.repository.interface'
import { resolveTargetPeriod } from '@/utils/resolve-target-period'

export class GetMonthTotalAmountUseCase {
  constructor(private readonly repo: ICardsRepository) {}

  async execute(
    id: string,
    userId: string,
    month?: number,
    year?: number,
  ): Promise<{ total: number; targetMonth: number; targetYear: number }> {
    const card = await this.repo.findById(id, userId)
    if (!card) throw new CardNotFoundError()
    const { targetMonth, targetYear } = resolveTargetPeriod(card.dueDay, month, year)
    const total = await this.repo.findMonthTotalAmount(id, targetMonth, targetYear)
    return { total, targetMonth, targetYear }
  }
}
