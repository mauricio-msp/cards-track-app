import type {
  Card,
  CardSummary,
  CreateCardInput,
  UpdateCardInput,
} from '@/modules/cards/http/dto/cards.dto'

export type CardPurchaseMember = {
  id: string
  name: string
  relationship: string
  installmentAmount: number
  perInstallmentAmount: number
  totalOwed: number
}

export type CardPurchase = {
  purchaseMemberId: string
  groupId: string
  description: string
  purchaseDate: string
  category: string | null
  totalAmount: number
  installmentsCount: number
  elapsedInstallments: number
  remainingInstallments: number
  anticipatedAt: string | null
  anticipatedInstallmentsCount: number | null
  anticipateFromInstallment: number | null
  anticipatableInstallments: number
  subscriptionId: string | null
  members: CardPurchaseMember[]
}

export type MemberPaymentSummary = {
  id: string
  name: string
  relationship: string
  totalOwed: number
  totalPaid: number
  remaining: number
  isLate: boolean | null
}

export interface ICardsRepository {
  findById(id: string, userId: string): Promise<Card | null>
  findAll(userId: string): Promise<CardSummary[]>
  create(userId: string, data: CreateCardInput): Promise<Card>
  update(id: string, data: UpdateCardInput): Promise<void>
  delete(id: string): Promise<void>
  hasActiveInstallments(cardId: string): Promise<boolean>
  findPurchases(
    cardId: string,
    card: Pick<Card, 'dueDay' | 'closingOffsetDays' | 'anticipationMode'>,
    targetMonth: number,
    targetYear: number,
  ): Promise<CardPurchase[]>
  findTotalAmountUsed(cardId: string, targetMonth: number, targetYear: number): Promise<number>
  findMonthTotalAmount(cardId: string, targetMonth: number, targetYear: number): Promise<number>
  findInvoicePaymentSummary(
    cardId: string,
    targetMonth: number,
    targetYear: number,
  ): Promise<MemberPaymentSummary[]>
  findAnticipatedPurchaseMembers(cardId: string): Promise<{ id: string }[]>
  getAnticipationAnchors(pmId: string): Promise<{ month: number; year: number; count: number }[]>
  revertAnticipationInInvoice(pmId: string, month: number, year: number): Promise<number>
  countAnticipatedInstallments(pmId: string): Promise<number>
  setPurchaseMemberAnticipation(pmId: string, anticipatedAt: Date | null): Promise<void>
  reapplyAnticipation(params: {
    pmId: string
    mode: 'gap' | 'tail'
    count: number
    anchorMonth: number
    anchorYear: number
    cardId: string
  }): Promise<number>
}
