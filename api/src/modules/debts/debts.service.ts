import { uuidv7 } from 'uuidv7'
import type { AnticipateDebtInput, CreateDebtInput } from '@/modules/debts/debts.dto'
import {
  DebtAlreadyAnticipatedError,
  DebtNotFoundError,
  DebtSharedBetweenMembersError,
  InvalidAnticipateInstallmentError,
  NoUnpaidInstallmentsError,
} from '@/modules/debts/debts.errors'
import type { IDebtsRepository } from '@/modules/debts/debts.repository.interface'
import { calculateInvoiceCompetence } from '@/utils/calculate-invoice-competence'
import { resolveTargetPeriod } from '@/utils/resolve-target-period'

export class DebtsService {
  constructor(private readonly repo: IDebtsRepository) {}

  async create(userId: string, data: CreateDebtInput) {
    const card = await this.repo.findCardByOwner(data.cardId, userId)
    if (!card) {
      throw new Error('Cartão não encontrado ou não pertence ao usuário')
    }

    const memberIds = data.members.map(m => m.id)
    const activeMembers = await this.repo.findActiveMembers(memberIds)
    if (activeMembers.length !== memberIds.length) {
      throw new Error('Um ou mais membros foram excluídos e não podem ter novas despesas')
    }

    const newPurchaseTotal = data.members.reduce((sum, m) => sum + m.amount, 0)
    const { targetMonth, targetYear } = resolveTargetPeriod(card.dueDay)
    const totalUnpaid = await this.repo.getTotalUnpaid(data.cardId, targetMonth, targetYear)

    if (totalUnpaid + newPurchaseTotal > card.limit) {
      const available = card.limit - totalUnpaid
      throw new Error(
        `Limite insuficiente. Disponível: R$${(available / 100).toFixed(2)}, necessário: R$${(newPurchaseTotal / 100).toFixed(2)}`,
      )
    }

    const [datePart] = data.purchaseDate.split('T')
    const purchaseDateResetHours = new Date(`${datePart}T00:00:00`)

    const { invoiceMonth, invoiceYear } = calculateInvoiceCompetence(
      purchaseDateResetHours,
      card.dueDay,
      card.closingOffsetDays,
    )

    const groupId = uuidv7()

    return this.repo.createDebtTransaction(
      data,
      card,
      groupId,
      invoiceMonth,
      invoiceYear,
      purchaseDateResetHours,
      userId,
    )
  }

  async deleteDebt(debtId: string, userId: string): Promise<void> {
    const target = await this.repo.findDebtGroupByIdAndOwner(debtId, userId)
    if (!target) throw new DebtNotFoundError()
    await this.repo.deleteByGroupId(target.groupId)
  }

  async deleteDebtMember(debtId: string, memberId: string, userId: string): Promise<void> {
    const target = await this.repo.findDebtByIdAndMemberAndOwner(debtId, memberId, userId)
    if (!target) throw new DebtNotFoundError()
    await this.repo.deleteById(target.id)
  }

  async anticipate(
    debtId: string,
    userId: string,
    data: AnticipateDebtInput,
  ): Promise<{ anticipatedAmount: number; installmentsAnticipated: number }> {
    const { anticipateFromInstallment } = data

    const debt = await this.repo.findDebtWithCardByOwner(debtId, userId)
    if (!debt) throw new DebtNotFoundError()

    if (debt.anticipatedAt) throw new DebtAlreadyAnticipatedError()

    const count = await this.repo.countDebtsByGroupId(debt.groupId)
    if (count > 1) throw new DebtSharedBetweenMembersError()

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
      dueDay: debt.card.dueDay,
      anticipateFromInstallment,
      anticipatedAmount,
    })

    return { anticipatedAmount, installmentsAnticipated: installmentsToAnticipate }
  }

  async getDebtsTrend(userId: string, year: number) {
    const rows = await this.repo.getDebtsTrend(userId, year)
    const uniqueCardNames = [...new Set(rows.map(r => r.cardName.toLowerCase()))]
    const monthMap = new Map<number, Record<string, number | string>>()

    for (let i = 0; i < 12; i++) {
      const entry: Record<string, number | string> = {
        date: `${year}-${String(i + 1).padStart(2, '0')}`,
      }
      for (const name of uniqueCardNames) entry[name] = 0
      monthMap.set(i, entry)
    }

    for (const row of rows) {
      const entry = monthMap.get(row.month)
      if (entry) entry[row.cardName.toLowerCase()] = row.total
    }

    return Array.from(monthMap.values())
  }

  async getDebtsYears(userId: string): Promise<number[]> {
    const years = await this.repo.getDebtsYears(userId)
    return years.length === 0 ? [new Date().getFullYear()] : years
  }

  async getMonthHighestDebtsAmount(userId: string, month: number, year: number) {
    const cardTotals = await this.repo.getMonthCardAmounts(userId, month, year)
    const highestAmount = cardTotals.length ? Math.max(...cardTotals.map(c => c.total)) : 0
    return {
      amount: highestAmount,
      cards: highestAmount > 0 ? cardTotals.filter(c => c.total === highestAmount) : [],
    }
  }

  async getMonthLowestDebtsAmount(userId: string, month: number, year: number) {
    const cardTotals = await this.repo.getMonthCardAmounts(userId, month, year)
    const lowestAmount = cardTotals.length ? Math.min(...cardTotals.map(c => c.total)) : 0
    return {
      amount: lowestAmount,
      cards: lowestAmount > 0 ? cardTotals.filter(c => c.total === lowestAmount) : [],
    }
  }

  async getMonthTotalDebtsAmount(userId: string): Promise<number> {
    const now = new Date()
    return this.repo.getMonthTotalDebtsAmount(
      userId,
      now.getMonth(),
      now.getFullYear(),
      now.getDate(),
    )
  }

  async getTotalDebtsAmount(userId: string): Promise<number> {
    return this.repo.getTotalDebtsAmount(userId)
  }
}
