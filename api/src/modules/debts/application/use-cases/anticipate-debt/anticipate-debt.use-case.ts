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

export class AnticipateDebtUseCase {
  constructor(private readonly repo: IDebtsRepository) {}

  async execute(
    debtId: string,
    userId: string,
    data: AnticipateDebtInput,
  ): Promise<{ anticipatedAmount: number; installmentsAnticipated: number }> {
    const { anticipateFromInstallment } = data

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

    const firstUnpaidNumber = unpaidInstallments[0].number

    if (anticipateFromInstallment < firstUnpaidNumber) {
      throw new InvalidAnticipateInstallmentError(
        `You can only anticipate from an unpaid installment. First allowed is ${firstUnpaidNumber}`,
      )
    }

    if (anticipateFromInstallment > debt.installmentsCount) {
      throw new InvalidAnticipateInstallmentError(
        `Invalid installment number. Last installment is ${debt.installmentsCount}`,
      )
    }

    const installmentsToAnticipate = debt.installmentsCount - anticipateFromInstallment + 1
    const anticipatedAmount = installmentsToAnticipate * debt.installmentsAmount

    await this.repo.anticipateInstallments({
      debtId,
      memberId: debt.memberId,
      cardId: debt.cardId,
      dueDay: raw.card.dueDay,
      anticipateFromInstallment,
      anticipatedAmount,
    })

    return { anticipatedAmount, installmentsAnticipated: installmentsToAnticipate }
  }
}
