import { CardHasActiveDebtsError, CardNotFoundError } from '@/modules/cards/cards.errors'
import type { ICardsRepository } from '@/modules/cards/cards.repository.interface'

export class DeleteCardUseCase {
  constructor(private readonly repo: ICardsRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const card = await this.repo.findById(id, userId)
    if (!card) throw new CardNotFoundError()
    const hasDebts = await this.repo.hasActiveInstallments(id)
    if (hasDebts) throw new CardHasActiveDebtsError()
    return this.repo.delete(id)
  }
}
