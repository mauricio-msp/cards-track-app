import type { CreatePurchaseInput } from '@/modules/purchases/http/dto/purchases.dto'

export type PurchaseCard = {
  id: string
  limit: number
  dueDay: number
  closingOffsetDays: number
}

export type PurchaseMemberWithCard = {
  id: string
  purchaseId: string
  cardId: string
  memberId: string
  installmentsCount: number
  installmentAmount: number
  anticipatedAt: Date | null
  card: { dueDay: number; closingOffsetDays: number; anticipationMode: 'none' | 'gap' | 'tail' }
}

export type PurchaseCreateResult = {
  purchaseId: string
  cardId: string
  description: string
  category: string | null
  purchaseDate: string
  installmentsCount: number
  members: {
    purchaseMemberId: string
    memberId: string
    amount: number
    installmentAmount: number
    startInstallment: number
    endInstallment: number | null
  }[]
}

export interface IPurchasesRepository {
  // validation
  findCardByOwner(cardId: string, userId: string): Promise<PurchaseCard | null>
  findActiveMembers(memberIds: string[]): Promise<{ id: string }[]>
  getTotalUnpaid(cardId: string, targetMonth: number, targetYear: number): Promise<number>

  // create
  createPurchase(
    data: CreatePurchaseInput,
    card: PurchaseCard,
    invoiceMonth: number,
    invoiceYear: number,
    purchaseDateResetHours: Date,
    userId: string,
  ): Promise<PurchaseCreateResult>

  // delete
  findPurchaseMemberByIdAndOwner(pmId: string, userId: string): Promise<{ purchaseId: string } | null>
  deletePurchase(purchaseId: string): Promise<void>
  findPurchaseMemberByIdMemberAndOwner(pmId: string, memberId: string, userId: string): Promise<{ id: string } | null>
  deletePurchaseMember(pmId: string): Promise<void>

  // anticipate
  findPurchaseMemberWithCard(pmId: string, userId: string): Promise<PurchaseMemberWithCard | null>
  countPurchaseMembers(purchaseId: string): Promise<number>
  findUnpaidFutureInstallments(
    pmId: string,
    currentMonth: number,
    currentYear: number,
  ): Promise<{ id: string; number: number }[]>
  relocateInstallmentsToCurrentInvoice(params: {
    installmentIds: string[]
    cardId: string
    dueDay: number
    closingOffsetDays: number
  }): Promise<void>
  markPurchaseMemberAnticipated(pmId: string): Promise<void>
}
