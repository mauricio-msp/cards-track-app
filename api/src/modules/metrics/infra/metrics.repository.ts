import { and, eq, sql } from 'drizzle-orm'
import type { db as Db } from '@/db'
import { cards, installments, invoices, members, purchaseMembers, purchases } from '@/db/schema'
import type {
  CardAmountRow,
  ChartDataRow,
  IMetricsRepository,
} from '@/modules/metrics/domain/repositories/metrics.repository.interface'

export class MetricsRepository implements IMetricsRepository {
  constructor(private readonly db: typeof Db) {}

  async getTrend(userId: string, year: number): Promise<ChartDataRow[]> {
    return this.db
      .select({
        cardName: cards.name,
        month: invoices.month,
        total: sql<number>`COALESCE(SUM(${installments.amount}), 0)`.mapWith(Number),
      })
      .from(installments)
      .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
      .innerJoin(purchaseMembers, eq(installments.purchaseMemberId, purchaseMembers.id))
      .innerJoin(purchases, eq(purchaseMembers.purchaseId, purchases.id))
      .innerJoin(cards, and(eq(purchases.cardId, cards.id), eq(cards.ownerUserId, userId)))
      .where(eq(invoices.year, year))
      .groupBy(cards.name, invoices.month)
      .orderBy(invoices.month)
  }

  async getYears(userId: string): Promise<number[]> {
    const rows = await this.db
      .selectDistinct({ year: invoices.year })
      .from(invoices)
      .innerJoin(installments, eq(installments.invoiceId, invoices.id))
      .innerJoin(purchaseMembers, eq(installments.purchaseMemberId, purchaseMembers.id))
      .innerJoin(purchases, eq(purchaseMembers.purchaseId, purchases.id))
      .innerJoin(cards, and(eq(purchases.cardId, cards.id), eq(cards.ownerUserId, userId)))
      .orderBy(sql`${invoices.year} DESC`)
    return rows.map(r => r.year)
  }

  async getMonthCardAmounts(userId: string, month: number, year: number): Promise<CardAmountRow[]> {
    return this.db
      .select({
        cardId: cards.id,
        cardName: cards.name,
        total: sql<number>`SUM(${installments.amount})`.mapWith(Number),
      })
      .from(installments)
      .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
      .innerJoin(purchaseMembers, eq(installments.purchaseMemberId, purchaseMembers.id))
      .innerJoin(purchases, eq(purchaseMembers.purchaseId, purchases.id))
      .innerJoin(cards, and(eq(purchases.cardId, cards.id), eq(cards.ownerUserId, userId)))
      .where(and(eq(invoices.month, month), eq(invoices.year, year)))
      .groupBy(cards.id, cards.name)
  }

  async getMonthTotalAmount(userId: string, month: number, year: number, today: number): Promise<number> {
    const [result] = await this.db
      .select({ total: sql<number>`COALESCE(SUM(${installments.amount}), 0)`.mapWith(Number) })
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
      .innerJoin(cards, and(eq(purchases.cardId, cards.id), eq(cards.ownerUserId, userId)))
      .where(and(eq(invoices.month, month), eq(invoices.year, year), sql`${cards.dueDay} > ${today}`))
    return result?.total ?? 0
  }

  async getTotalAmount(userId: string): Promise<number> {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    const today = now.getDate()

    const [result] = await this.db
      .select({ total: sql<number>`COALESCE(SUM(${installments.amount}), 0)`.mapWith(Number) })
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
      .innerJoin(cards, and(eq(purchases.cardId, cards.id), eq(cards.ownerUserId, userId)))
      .innerJoin(members, and(eq(purchaseMembers.memberId, members.id), eq(members.userId, userId)))
      .where(sql`
        (${invoices.year} > ${currentYear}) OR
        (${invoices.year} = ${currentYear} AND ${invoices.month} > ${currentMonth}) OR
        (${invoices.year} = ${currentYear} AND ${invoices.month} = ${currentMonth} AND ${cards.dueDay} >= ${today})
      `)
    return result?.total ?? 0
  }
}
