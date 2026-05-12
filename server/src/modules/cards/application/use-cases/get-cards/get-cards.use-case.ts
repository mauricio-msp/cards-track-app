import type { ICardsRepository } from '@/modules/cards/domain/repositories/cards.repository.interface'
import type { Card } from '@/modules/cards/http/dto/cards.dto'

export class GetCardsUseCase {
  constructor(private readonly repo: ICardsRepository) {}

  async execute(
    userId: string,
  ): Promise<Pick<Card, 'id' | 'name' | 'limit' | 'closingOffsetDays' | 'dueDay'>[]> {
    return this.repo.findAll(userId)
  }
}
