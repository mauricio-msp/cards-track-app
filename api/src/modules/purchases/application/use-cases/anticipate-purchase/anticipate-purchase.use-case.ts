import { PurchaseMemberEntity } from '@/modules/purchases/domain/entities/purchase-member.entity'
import {
  InvalidAnticipateInstallmentError,
  NoUnpaidInstallmentsError,
  PurchaseAlreadyAnticipatedError,
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

    const raw = await this.repo.findPurchaseMemberWithCard(pmId, userId)
    if (!raw) throw new PurchaseNotFoundError()

    const pm = new PurchaseMemberEntity(
      raw.id,
      raw.purchaseId,
      raw.cardId,
      raw.memberId,
      raw.installmentsCount,
      raw.installmentAmount,
      raw.anticipatedAt,
    )

    if (pm.isAnticipated()) throw new PurchaseAlreadyAnticipatedError()

    const count = await this.repo.countPurchaseMembers(pm.purchaseId)
    if (pm.isShared(count)) throw new PurchaseSharedBetweenMembersError()

    const unpaidInstallments = await this.repo.findUnpaidInstallments(pmId)
    if (unpaidInstallments.length === 0) throw new NoUnpaidInstallmentsError()

    const { invoiceMonth: targetMonth, invoiceYear: targetYear } = calculateInvoiceCompetence(
      new Date(),
      raw.card.dueDay,
      raw.card.closingOffsetDays,
    )

    const firstAnticipatable = unpaidInstallments.find(
      inst =>
        inst.invoiceYear > targetYear ||
        (inst.invoiceYear === targetYear && inst.invoiceMonth > targetMonth),
    )

    if (!firstAnticipatable) throw new NoUnpaidInstallmentsError()

    const lastAnticipated = firstAnticipatable.number + anticipateCount - 1
    if (lastAnticipated > pm.installmentsCount) {
      throw new InvalidAnticipateInstallmentError(
        `Não é possível antecipar ${anticipateCount} parcelas. Disponíveis: ${pm.installmentsCount - firstAnticipatable.number + 1}`,
      )
    }

    const anticipatedAmount = anticipateCount * pm.installmentAmount

    await this.repo.anticipateInstallments({
      pmId,
      memberId: pm.memberId,
      cardId: pm.cardId,
      dueDay: raw.card.dueDay,
      closingOffsetDays: raw.card.closingOffsetDays,
      anticipateFromInstallment: firstAnticipatable.number,
      anticipateCount,
      anticipatedAmount,
    })

    return { anticipatedAmount, installmentsAnticipated: anticipateCount }
  }
}
