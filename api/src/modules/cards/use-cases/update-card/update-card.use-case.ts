import type { UpdateCardInput } from '@/modules/cards/cards.dto'
import { CardNotFoundError } from '@/modules/cards/cards.errors'
import type { ICardsRepository } from '@/modules/cards/cards.repository.interface'

export class UpdateCardUseCase {
  constructor(private readonly repo: ICardsRepository) {}

  async execute(id: string, userId: string, data: UpdateCardInput): Promise<void> {
    const card = await this.repo.findById(id, userId)
    if (!card) throw new CardNotFoundError()
    return this.repo.update(id, data)
  }
}
