import {
  CardDoesNotSupportAnticipationError,
  InvalidAnticipateInstallmentError,
  NoUnpaidInstallmentsError,
  PurchaseNotFoundError,
  PurchaseSharedBetweenMembersError,
} from '@/modules/purchases/domain/errors/purchases.errors'
import type { IPurchasesRepository } from '@/modules/purchases/domain/repositories/purchases.repository.interface'
import type { AnticipatePurchaseInput } from '@/modules/purchases/http/dto/purchases.dto'
import { calculateInvoiceCompetence } from '@/utils/calculate-invoice-competence'

export class AnticipatePurchaseUseCase {
  constructor(private readonly repo: IPurchasesRepository) {}

  async execute(
    pmId: string,
    userId: string,
    data: AnticipatePurchaseInput,
  ): Promise<{ anticipatedAmount: number; installmentsAnticipated: number }> {
    const { anticipateCount } = data

    const pm = await this.repo.findPurchaseMemberWithCard(pmId, userId)
    if (!pm) throw new PurchaseNotFoundError()

    if (pm.card.anticipationMode === 'none') throw new CardDoesNotSupportAnticipationError()

    const count = await this.repo.countPurchaseMembers(pm.purchaseId)
    if (count > 1) throw new PurchaseSharedBetweenMembersError()

    const { invoiceMonth, invoiceYear } = calculateInvoiceCompetence(
      new Date(),
      pm.card.dueDay,
      pm.card.closingOffsetDays,
    )

    const candidates = await this.repo.findUnpaidFutureInstallments(pmId, invoiceMonth, invoiceYear)
    if (candidates.length === 0) throw new NoUnpaidInstallmentsError()

    if (anticipateCount > candidates.length) {
      throw new InvalidAnticipateInstallmentError(
        `Não é possível antecipar ${anticipateCount} parcelas. Disponíveis: ${candidates.length}`,
      )
    }

    // candidates come ordered by number ASC.
    const selected =
      pm.card.anticipationMode === 'tail'
        ? [...candidates].reverse().slice(0, anticipateCount)
        : candidates.slice(0, anticipateCount)

    await this.repo.relocateInstallmentsToCurrentInvoice({
      installmentIds: selected.map(s => s.id),
      cardId: pm.cardId,
      dueDay: pm.card.dueDay,
      closingOffsetDays: pm.card.closingOffsetDays,
    })

    await this.repo.markPurchaseMemberAnticipated(pmId)

    return {
      anticipatedAmount: anticipateCount * pm.installmentAmount,
      installmentsAnticipated: anticipateCount,
    }
  }
}
