import type { ICardsRepository } from '@/modules/cards/domain/repositories/cards.repository.interface'
import type { CardSummary } from '@/modules/cards/http/dto/cards.dto'

export class GetCardsUseCase {
  constructor(private readonly repo: ICardsRepository) {}

  async execute(userId: string): Promise<CardSummary[]> {
    return this.repo.findAll(userId)
  }
}
