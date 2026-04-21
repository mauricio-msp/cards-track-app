import type { Card } from '@/modules/cards/cards.dto'
import { CardNotFoundError } from '@/modules/cards/cards.errors'
import type { ICardsRepository } from '@/modules/cards/cards.repository.interface'

export class GetCardUseCase {
  constructor(private readonly repo: ICardsRepository) {}

  async execute(id: string, userId: string): Promise<Card> {
    const card = await this.repo.findById(id, userId)
    if (!card) throw new CardNotFoundError()
    return card
  }
}
