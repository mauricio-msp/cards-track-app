import { CardNotFoundError } from '@/modules/cards/domain/errors/cards.errors'
import type { ICardsRepository } from '@/modules/cards/domain/repositories/cards.repository.interface'
import type { UpdateCardInput } from '@/modules/cards/http/dto/cards.dto'

export class UpdateCardUseCase {
  constructor(private readonly repo: ICardsRepository) {}

  async execute(id: string, userId: string, data: UpdateCardInput): Promise<void> {
    const card = await this.repo.findById(id, userId)

    if (!card) throw new CardNotFoundError()

    return this.repo.update(id, data)
  }
}
