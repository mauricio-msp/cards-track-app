import { CardNotFoundError } from '@/modules/cards/domain/errors/cards.errors'
import type { ICardsRepository } from '@/modules/cards/domain/repositories/cards.repository.interface'
import { resolveTargetPeriod } from '@/utils/resolve-target-period'

export class GetTotalAmountUsedUseCase {
  constructor(private readonly repo: ICardsRepository) {}

  async execute(id: string, userId: string): Promise<number> {
    const card = await this.repo.findById(id, userId)

    if (!card) throw new CardNotFoundError()

    const { targetMonth, targetYear } = resolveTargetPeriod(card.dueDay)

    return this.repo.findTotalAmountUsed(id, targetMonth, targetYear)
  }
}
