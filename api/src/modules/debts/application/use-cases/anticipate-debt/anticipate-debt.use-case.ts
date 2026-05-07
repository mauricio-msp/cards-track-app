import { DebtEntity } from '@/modules/debts/domain/entities/debt.entity'
import {
  DebtAlreadyAnticipatedError,
  DebtNotFoundError,
  DebtSharedBetweenMembersError,
  InvalidAnticipateInstallmentError,
  NoUnpaidInstallmentsError,
} from '@/modules/debts/domain/errors/debts.errors'
import type { IDebtsRepository } from '@/modules/debts/domain/repositories/debts.repository.interface'
import type { AnticipateDebtInput } from '@/modules/debts/http/dto/debts.dto'
import { calculateInvoiceCompetence } from '@/utils/calculate-invoice-competence'

export class AnticipateDebtUseCase {
  constructor(private readonly repo: IDebtsRepository) {}

  async execute(
    debtId: string,
    userId: string,
    data: AnticipateDebtInput,
  ): Promise<{ anticipatedAmount: number; installmentsAnticipated: number }> {
    const { anticipateCount } = data

    const raw = await this.repo.findDebtWithCardByOwner(debtId, userId)
    if (!raw) throw new DebtNotFoundError()

    const debt = new DebtEntity(
      raw.id,
      raw.groupId,
      raw.cardId,
      raw.memberId,
      raw.installmentsCount,
      raw.installmentsAmount,
      raw.anticipatedAt,
    )

    if (debt.isAnticipated()) throw new DebtAlreadyAnticipatedError()

    const count = await this.repo.countDebtsByGroupId(debt.groupId)
    if (debt.isShared(count)) throw new DebtSharedBetweenMembersError()

    const unpaidInstallments = await this.repo.findUnpaidInstallmentNumbers(debtId)
    if (unpaidInstallments.length === 0) throw new NoUnpaidInstallmentsError()

    const { invoiceMonth: targetMonth, invoiceYear: targetYear } = calculateInvoiceCompetence(
      new Date(),
      raw.card.dueDay,
      raw.card.closingOffsetDays,
    )

    // First unpaid installment in an invoice strictly after the target (where the consolidation will land)
    const firstAnticipatable = unpaidInstallments.find(
      inst =>
        inst.invoiceYear > targetYear ||
        (inst.invoiceYear === targetYear && inst.invoiceMonth > targetMonth),
    )

    if (!firstAnticipatable) throw new NoUnpaidInstallmentsError()

    const lastAnticipated = firstAnticipatable.number + anticipateCount - 1

    if (lastAnticipated > debt.installmentsCount) {
      throw new InvalidAnticipateInstallmentError(
        `Cannot anticipate ${anticipateCount} installments. Only ${debt.installmentsCount - firstAnticipatable.number + 1} available.`,
      )
    }

    const anticipatedAmount = anticipateCount * debt.installmentsAmount

    await this.repo.anticipateInstallments({
      debtId,
      memberId: debt.memberId,
      cardId: debt.cardId,
      dueDay: raw.card.dueDay,
      closingOffsetDays: raw.card.closingOffsetDays,
      anticipateFromInstallment: firstAnticipatable.number,
      anticipateCount,
      anticipatedAmount,
    })

    return { anticipatedAmount, installmentsAnticipated: anticipateCount }
  }
}
