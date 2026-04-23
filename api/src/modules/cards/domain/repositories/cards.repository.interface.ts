import type { Card, CreateCardInput, UpdateCardInput } from '@/modules/cards/http/dto/cards.dto'

export type CardDebt = {
  debtId: string
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
  subscriptionId: string | null
  members: Array<{
    id: string
    name: string
    relationship: string
    installmentAmount: number
  }>
}

export interface ICardsRepository {
  findById(id: string, userId: string): Promise<Card | null>
  findAll(
    userId: string,
  ): Promise<Pick<Card, 'id' | 'name' | 'limit' | 'closingOffsetDays' | 'dueDay'>[]>
  create(userId: string, data: CreateCardInput): Promise<Card>
  update(id: string, data: UpdateCardInput): Promise<void>
  delete(id: string): Promise<void>
  hasActiveInstallments(cardId: string): Promise<boolean>
  findDebts(
    cardId: string,
    card: Pick<Card, 'dueDay' | 'closingOffsetDays'>,
    targetMonth: number,
    targetYear: number,
  ): Promise<CardDebt[]>
  findTotalAmountUsed(cardId: string, targetMonth: number, targetYear: number): Promise<number>
  findMonthTotalAmount(cardId: string, targetMonth: number, targetYear: number): Promise<number>
}
