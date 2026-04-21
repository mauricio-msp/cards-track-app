import type { Card, CreateCardInput } from '@/modules/cards/cards.dto'
import type { ICardsRepository } from '@/modules/cards/cards.repository.interface'

export class CreateCardUseCase {
  constructor(private readonly repo: ICardsRepository) {}

  async execute(userId: string, data: CreateCardInput): Promise<Card> {
    return this.repo.create(userId, data)
  }
}
