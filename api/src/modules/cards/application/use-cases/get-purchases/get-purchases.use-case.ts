import { CardNotFoundError } from '@/modules/cards/domain/errors/cards.errors'
import type {
  CardPurchase,
  ICardsRepository,
} from '@/modules/cards/domain/repositories/cards.repository.interface'
import { resolveTargetPeriod } from '@/utils/resolve-target-period'

export class GetPurchasesUseCase {
  constructor(private readonly repo: ICardsRepository) {}

  async execute(
    id: string,
    userId: string,
    month?: number,
    year?: number,
  ): Promise<CardPurchase[]> {
    const card = await this.repo.findById(id, userId)

    if (!card) throw new CardNotFoundError()

    const { targetMonth, targetYear } = resolveTargetPeriod(card.dueDay, month, year)

    return this.repo.findPurchases(id, card, targetMonth, targetYear)
  }
}
