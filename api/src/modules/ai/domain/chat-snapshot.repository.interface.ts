export type SnapshotMember = { id: string; name: string }

export type SnapshotCard = {
  id: string
  name: string
  dueDay: number
  closingOffsetDays: number
}

export type SnapshotPurchaseRow = {
  purchaseId: string
  description: string
  installmentsCount: number
  cardName: string
  memberName: string
  installmentAmount: number
}

export type SnapshotSubscription = {
  name: string
  amount: number
  cardName: string
  memberName: string
}

export type SnapshotPayment = {
  memberName: string
  cardName: string
  amount: number
}

export type SnapshotCardTotal = {
  cardName: string
  total: number
}

export interface IChatSnapshotRepository {
  getMembers(userId: string): Promise<SnapshotMember[]>
  getCards(userId: string): Promise<SnapshotCard[]>
  getPurchaseRows(userId: string, month: number, year: number): Promise<SnapshotPurchaseRow[]>
  getSubscriptions(userId: string): Promise<SnapshotSubscription[]>
  getPayments(userId: string, month: number, year: number): Promise<SnapshotPayment[]>
  getCardTotals(userId: string, month: number, year: number): Promise<SnapshotCardTotal[]>
}
