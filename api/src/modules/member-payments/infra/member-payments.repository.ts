import { and, eq, sql } from 'drizzle-orm'
import type { db as Db } from '@/db'
import { installments, invoices, memberPayments, purchaseMembers, purchases } from '@/db/schema'
import type {
  CreateMemberPaymentData,
  IMemberPaymentsRepository,
  MemberPayment,
  UpdateMemberPaymentData,
} from '@/modules/member-payments/domain/repositories/member-payments.repository.interface'

export class MemberPaymentsRepository implements IMemberPaymentsRepository {
  constructor(private readonly db: typeof Db) {}

  async findByPeriod(
    memberId: string,
    cardId: string,
    targetMonth: number,
    targetYear: number,
  ): Promise<MemberPayment[]> {
    const rows = await this.db
      .select()
      .from(memberPayments)
      .where(
        and(
          eq(memberPayments.memberId, memberId),
          eq(memberPayments.cardId, cardId),
          eq(memberPayments.targetMonth, targetMonth),
          eq(memberPayments.targetYear, targetYear),
        ),
      )
      .orderBy(memberPayments.paidAt)

    return rows.map(row => ({ ...row, paidAt: row.paidAt, createdAt: row.createdAt }))
  }

  async findInstallmentsTotalByPeriod(
    memberId: string,
    cardId: string,
    targetMonth: number,
    targetYear: number,
  ): Promise<number> {
    const [result] = await this.db
      .select({
        total: sql<number>`
          COALESCE(
            SUM(
              CASE
                WHEN ${installments.number} >= ${purchaseMembers.startInstallment}
                  AND ${installments.number} <= COALESCE(${purchaseMembers.endInstallment}, ${purchases.installmentsCount})
                THEN ${installments.amount}
                ELSE 0
              END
            ),
            0
          )
        `.mapWith(Number),
      })
      .from(installments)
      .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
      .innerJoin(purchaseMembers, eq(installments.purchaseMemberId, purchaseMembers.id))
      .innerJoin(purchases, eq(purchaseMembers.purchaseId, purchases.id))
      .where(
        and(
          eq(installments.memberId, memberId),
          eq(invoices.cardId, cardId),
          eq(invoices.month, targetMonth),
          eq(invoices.year, targetYear),
        ),
      )

    return Number(result?.total ?? 0)
  }

  async findById(id: string): Promise<MemberPayment | null> {
    const [row] = await this.db
      .select()
      .from(memberPayments)
      .where(eq(memberPayments.id, id))
      .limit(1)

    return row ?? null
  }

  async create(data: CreateMemberPaymentData): Promise<MemberPayment> {
    const [row] = await this.db
      .insert(memberPayments)
      .values({
        memberId: data.memberId,
        cardId: data.cardId,
        targetMonth: data.targetMonth,
        targetYear: data.targetYear,
        amount: data.amount,
        paidAt: data.paidAt,
        description: data.description,
      })
      .returning()

    return row
  }

  async update(id: string, data: UpdateMemberPaymentData): Promise<MemberPayment> {
    const updates: Partial<typeof memberPayments.$inferInsert> = {}

    if (data.amount !== undefined) updates.amount = data.amount
    if (data.paidAt !== undefined) updates.paidAt = data.paidAt
    if (data.description !== undefined) updates.description = data.description

    const [row] = await this.db
      .update(memberPayments)
      .set(updates)
      .where(eq(memberPayments.id, id))
      .returning()

    return row
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(memberPayments).where(eq(memberPayments.id, id))
  }
}
