import type { ICardsRepository } from '@/modules/cards/domain/repositories/cards.repository.interface'
import type { Card, CreateCardInput } from '@/modules/cards/http/dto/cards.dto'

export class CreateCardUseCase {
  constructor(private readonly repo: ICardsRepository) {}

  async execute(userId: string, data: CreateCardInput): Promise<Card> {
    return this.repo.create(userId, data)
  }
}
