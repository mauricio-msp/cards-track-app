import { CardNotFoundError } from '@/modules/cards/domain/errors/cards.errors'
import type {
  ICardsRepository,
  MemberPaymentSummary,
} from '@/modules/cards/domain/repositories/cards.repository.interface'
import { resolveTargetPeriod } from '@/utils/resolve-target-period'

export type GetInvoicePaymentSummaryResult = {
  invoiceTotal: number
  members: MemberPaymentSummary[]
}

export class GetInvoicePaymentSummaryUseCase {
  constructor(private readonly repo: ICardsRepository) {}

  async execute(
    cardId: string,
    userId: string,
    month?: number,
    year?: number,
  ): Promise<GetInvoicePaymentSummaryResult> {
    const card = await this.repo.findById(cardId, userId)
    if (!card) throw new CardNotFoundError()

    const { targetMonth, targetYear } = resolveTargetPeriod(card.dueDay, month, year)

    const members = await this.repo.findInvoicePaymentSummary(cardId, targetMonth, targetYear)
    const invoiceTotal = members.reduce((sum, m) => sum + m.totalOwed, 0)

    return { invoiceTotal, members }
  }
}
