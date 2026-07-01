import { CardNotFoundError } from '@/modules/cards/domain/errors/cards.errors'
import type { ICardsRepository } from '@/modules/cards/domain/repositories/cards.repository.interface'

export type ReconcileResult = {
  cotasAfetadas: number
  parcelasMovidas: number
  valorRealocado: number
}

export class ReconcileAnticipationsUseCase {
  constructor(private readonly repo: ICardsRepository) {}

  async execute(cardId: string, userId: string): Promise<ReconcileResult> {
    const card = await this.repo.findById(cardId, userId)
    if (!card) throw new CardNotFoundError()

    const pms = await this.repo.findAnticipatedPurchaseMembers(cardId)

    let cotasAfetadas = 0
    let parcelasMovidas = 0

    for (const pm of pms) {
      const anchor = await this.repo.getAnticipationAnchor(pm.id)
      if (!anchor) continue

      await this.repo.revertAnticipation(pm.id)
      cotasAfetadas++

      if (card.anticipationMode === 'none') continue

      const moved = await this.repo.reapplyAnticipation({
        pmId: pm.id,
        mode: card.anticipationMode,
        count: anchor.count,
        anchorMonth: anchor.month,
        anchorYear: anchor.year,
        cardId,
      })
      parcelasMovidas += moved
    }

    return { cotasAfetadas, parcelasMovidas, valorRealocado: parcelasMovidas }
  }
}
