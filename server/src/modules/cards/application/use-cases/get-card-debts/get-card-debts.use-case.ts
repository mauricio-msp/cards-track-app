import { CardNotFoundError } from '@/modules/cards/domain/errors/cards.errors'
import type {
  CardDebt,
  ICardsRepository,
} from '@/modules/cards/domain/repositories/cards.repository.interface'
import { resolveTargetPeriod } from '@/utils/resolve-target-period'

export class GetCardDebtsUseCase {
  constructor(private readonly repo: ICardsRepository) {}

  async execute(id: string, userId: string, month?: number, year?: number): Promise<CardDebt[]> {
    const card = await this.repo.findById(id, userId)
    if (!card) throw new CardNotFoundError()
    const { targetMonth, targetYear } = resolveTargetPeriod(card.dueDay, month, year)
    return this.repo.findDebts(id, card, targetMonth, targetYear)
  }
}
