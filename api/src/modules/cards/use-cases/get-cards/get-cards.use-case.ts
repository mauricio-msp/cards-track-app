import type { ICardsRepository } from '@/modules/cards/cards.repository.interface'

export class GetCardsUseCase {
  constructor(private readonly repo: ICardsRepository) {}

  async execute(userId: string) {
    return this.repo.findAll(userId)
  }
}
