import { and, eq, isNull, sql } from 'drizzle-orm'
import type { db as Db } from '@/db'
import {
  cards,
  installments,
  invoices,
  memberPayments,
  members,
  purchaseMembers,
  purchases,
  subscriptions,
} from '@/db/schema'
import type {
  IChatSnapshotRepository,
  SnapshotCard,
  SnapshotCardTotal,
  SnapshotMember,
  SnapshotPayment,
  SnapshotPurchaseRow,
  SnapshotSubscription,
} from '@/modules/ai/domain/chat-snapshot.repository.interface'

export class ChatSnapshotRepository implements IChatSnapshotRepository {
  constructor(private readonly db: typeof Db) {}

  async getMembers(userId: string): Promise<SnapshotMember[]> {
    return this.db
      .select({ id: members.id, name: members.name })
      .from(members)
      .where(and(eq(members.userId, userId), isNull(members.deletedAt)))
  }

  async getCards(userId: string): Promise<SnapshotCard[]> {
    return this.db
      .select({
        id: cards.id,
        name: cards.name,
        dueDay: cards.dueDay,
        closingOffsetDays: cards.closingOffsetDays,
      })
      .from(cards)
      .where(eq(cards.ownerUserId, userId))
  }

  async getPurchaseRows(
    userId: string,
    month: number,
    year: number,
  ): Promise<SnapshotPurchaseRow[]> {
    const rows = await this.db
      .select({
        purchaseId: purchases.id,
        description: purchases.description,
        installmentsCount: purchases.installmentsCount,
        cardName: cards.name,
        memberName: members.name,
        installmentAmount: installments.amount,
      })
      .from(installments)
      .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
      .innerJoin(
        purchaseMembers,
        and(
          eq(installments.purchaseMemberId, purchaseMembers.id),
          sql`${installments.number} >= ${purchaseMembers.startInstallment}`,
        ),
      )
      .innerJoin(
        purchases,
        and(
          eq(purchaseMembers.purchaseId, purchases.id),
          sql`${installments.number} <= COALESCE(${purchaseMembers.endInstallment}, ${purchases.installmentsCount})`,
        ),
      )
      .innerJoin(members, eq(purchaseMembers.memberId, members.id))
      .innerJoin(
        cards,
        and(eq(purchases.cardId, cards.id), eq(cards.ownerUserId, userId)),
      )
      .where(and(eq(invoices.month, month), eq(invoices.year, year)))

    return rows.map(r => ({ ...r, installmentAmount: Number(r.installmentAmount) }))
  }

  async getSubscriptions(userId: string): Promise<SnapshotSubscription[]> {
    const rows = await this.db
      .select({
        name: subscriptions.name,
        amount: subscriptions.amount,
        cardName: cards.name,
        memberName: members.name,
      })
      .from(subscriptions)
      .innerJoin(cards, eq(subscriptions.cardId, cards.id))
      .innerJoin(members, eq(subscriptions.memberId, members.id))
      .where(and(eq(cards.ownerUserId, userId), eq(subscriptions.active, true), isNull(subscriptions.deletedAt)))

    return rows.map(r => ({ ...r, amount: Number(r.amount) }))
  }

  async getPayments(
    userId: string,
    month: number,
    year: number,
  ): Promise<SnapshotPayment[]> {
    const rows = await this.db
      .select({
        memberName: members.name,
        cardName: cards.name,
        amount: memberPayments.amount,
      })
      .from(memberPayments)
      .innerJoin(members, eq(memberPayments.memberId, members.id))
      .innerJoin(
        cards,
        and(eq(memberPayments.cardId, cards.id), eq(cards.ownerUserId, userId)),
      )
      .where(
        and(
          eq(memberPayments.targetMonth, month),
          eq(memberPayments.targetYear, year),
        ),
      )

    return rows.map(r => ({ ...r, amount: Number(r.amount) }))
  }

  async getCardTotals(
    userId: string,
    month: number,
    year: number,
  ): Promise<SnapshotCardTotal[]> {
    return this.db
      .select({
        cardName: cards.name,
        total: sql<number>`COALESCE(SUM(${installments.amount}), 0)`.mapWith(Number),
      })
      .from(installments)
      .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
      .innerJoin(
        purchaseMembers,
        and(
          eq(installments.purchaseMemberId, purchaseMembers.id),
          sql`${installments.number} >= ${purchaseMembers.startInstallment}`,
        ),
      )
      .innerJoin(
        purchases,
        and(
          eq(purchaseMembers.purchaseId, purchases.id),
          sql`${installments.number} <= COALESCE(${purchaseMembers.endInstallment}, ${purchases.installmentsCount})`,
        ),
      )
      .innerJoin(
        cards,
        and(eq(purchases.cardId, cards.id), eq(cards.ownerUserId, userId)),
      )
      .where(and(eq(invoices.month, month), eq(invoices.year, year)))
      .groupBy(cards.name)
  }
}
