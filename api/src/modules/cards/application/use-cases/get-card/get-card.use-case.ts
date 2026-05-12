import { CardNotFoundError } from '@/modules/cards/domain/errors/cards.errors'
import type { ICardsRepository } from '@/modules/cards/domain/repositories/cards.repository.interface'
import type { Card } from '@/modules/cards/http/dto/cards.dto'

export class GetCardUseCase {
  constructor(private readonly repo: ICardsRepository) {}

  async execute(id: string, userId: string): Promise<Card> {
    const card = await this.repo.findById(id, userId)

    if (!card) throw new CardNotFoundError()

    return card
  }
}
