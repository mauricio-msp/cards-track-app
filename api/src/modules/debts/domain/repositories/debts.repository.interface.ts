import type { debts } from '@/db/schema'
import type { CreateDebtInput } from '@/modules/debts/http/dto/debts.dto'

export type DebtCard = {
  id: string
  limit: number
  dueDay: number
  closingOffsetDays: number
}

export type DebtWithCard = {
  id: string
  groupId: string
  cardId: string
  memberId: string
  installmentsCount: number
  installmentsAmount: number
  anticipatedAt: Date | null
  card: { dueDay: number; closingOffsetDays: number }
}

export type ChartDataRow = {
  cardName: string
  month: number
  total: number
}

export type CardAmountRow = {
  cardId: string
  cardName: string
  total: number
}

export interface IDebtsRepository {
  // create
  findCardByOwner(cardId: string, userId: string): Promise<DebtCard | null>
  findActiveMembers(memberIds: string[]): Promise<{ id: string }[]>
  getTotalUnpaid(cardId: string, targetMonth: number, targetYear: number): Promise<number>
  createDebtTransaction(
    data: CreateDebtInput,
    card: DebtCard,
    groupId: string,
    invoiceMonth: number,
    invoiceYear: number,
    purchaseDateResetHours: Date,
    userId: string,
  ): Promise<(typeof debts.$inferSelect)[]>

  // delete
  findDebtGroupByIdAndOwner(debtId: string, userId: string): Promise<{ groupId: string } | null>
  deleteByGroupId(groupId: string): Promise<void>
  findDebtByIdAndMemberAndOwner(
    debtId: string,
    memberId: string,
    userId: string,
  ): Promise<{ id: string } | null>
  deleteById(id: string): Promise<void>

  // anticipate
  findDebtWithCardByOwner(debtId: string, userId: string): Promise<DebtWithCard | null>
  countDebtsByGroupId(groupId: string): Promise<number>
  findUnpaidInstallmentNumbers(
    debtId: string,
  ): Promise<{ number: number; invoiceMonth: number; invoiceYear: number }[]>
  anticipateInstallments(params: {
    debtId: string
    memberId: string
    cardId: string
    dueDay: number
    closingOffsetDays: number
    anticipateFromInstallment: number
    anticipateCount: number
    anticipatedAmount: number
  }): Promise<void>

  // queries
  getDebtsTrend(userId: string, year: number): Promise<ChartDataRow[]>
  getDebtsYears(userId: string): Promise<number[]>
  getMonthCardAmounts(userId: string, month: number, year: number): Promise<CardAmountRow[]>
  getMonthTotalDebtsAmount(
    userId: string,
    month: number,
    year: number,
    today: number,
  ): Promise<number>
  getTotalDebtsAmount(userId: string): Promise<number>
}
