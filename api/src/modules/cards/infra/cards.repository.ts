import { and, eq, inArray, isNotNull, isNull, sql } from 'drizzle-orm'
import type { db as Db } from '@/db'
import {
  cards,
  installments,
  invoices,
  memberCoverages,
  memberPayments,
  members,
  purchaseMembers,
  purchases,
} from '@/db/schema'
import type {
  CardPurchase,
  CardPurchaseMember,
  ICardsRepository,
  MemberPaymentSummary,
} from '@/modules/cards/domain/repositories/cards.repository.interface'
import type {
  Card,
  CardSummary,
  CreateCardInput,
  UpdateCardInput,
} from '@/modules/cards/http/dto/cards.dto'
import { calculateConsolidation } from '@/utils/calculate-consolidation'
import { calculateInvoiceCompetence } from '@/utils/calculate-invoice-competence'

type PurchaseRow = {
  pm: typeof purchaseMembers.$inferSelect
  purchase: typeof purchases.$inferSelect
  member: typeof members.$inferSelect
  installment: typeof installments.$inferSelect
}

export class CardsRepository implements ICardsRepository {
  constructor(private readonly db: typeof Db) {}

  async findById(id: string, userId: string): Promise<Card | null> {
    const [card] = await this.db
      .select()
      .from(cards)
      .where(and(eq(cards.id, id), eq(cards.ownerUserId, userId)))
      .limit(1)

    return card ?? null
  }

  async findAll(userId: string): Promise<CardSummary[]> {
    return this.db
      .select({
        id: cards.id,
        name: cards.name,
        limit: cards.limit,
        closingOffsetDays: cards.closingOffsetDays,
        dueDay: cards.dueDay,
        anticipationMode: cards.anticipationMode,
      })
      .from(cards)
      .where(eq(cards.ownerUserId, userId))
  }

  async create(userId: string, data: CreateCardInput): Promise<Card> {
    const [card] = await this.db
      .insert(cards)
      .values({
        name: data.name,
        limit: data.limit,
        closingOffsetDays: data.closingOffsetDays,
        dueDay: data.dueDay,
        anticipationMode: data.anticipationMode,
        ownerUserId: userId,
      })
      .returning()

    return card
  }

  async update(id: string, data: UpdateCardInput): Promise<void> {
    await this.db
      .update(cards)
      .set({ limit: data.limit, closingOffsetDays: data.closingOffsetDays, dueDay: data.dueDay, anticipationMode: data.anticipationMode })
      .where(eq(cards.id, id))
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(cards).where(eq(cards.id, id))
  }

  async hasActiveInstallments(cardId: string): Promise<boolean> {
    const [check] = await this.db
      .select({ id: installments.id })
      .from(installments)
      .innerJoin(purchaseMembers, eq(installments.purchaseMemberId, purchaseMembers.id))
      .innerJoin(
        purchases,
        and(eq(purchaseMembers.purchaseId, purchases.id), eq(purchases.cardId, cardId)),
      )
      .where(isNull(installments.paidAt))
      .limit(1)

    return !!check
  }

  async findPurchases(
    cardId: string,
    card: Pick<Card, 'dueDay' | 'closingOffsetDays' | 'anticipationMode'>,
    targetMonth: number,
    targetYear: number,
  ): Promise<CardPurchase[]> {
    const rows = await this.db
      .select({
        pm: purchaseMembers,
        purchase: purchases,
        member: members,
        installment: installments,
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
      .where(
        and(
          eq(invoices.cardId, cardId),
          eq(invoices.month, targetMonth),
          eq(invoices.year, targetYear),
        ),
      )

    return this.mapPurchaseRows(rows, targetMonth, targetYear, card)
  }

  async findTotalAmountUsed(
    cardId: string,
    targetMonth: number,
    targetYear: number,
  ): Promise<number> {
    const [result] = await this.db
      .select({
        total: sql<number>`COALESCE(SUM(${installments.amount}), 0)`.mapWith(Number),
      })
      .from(installments)
      .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
      .innerJoin(purchaseMembers, eq(installments.purchaseMemberId, purchaseMembers.id))
      .innerJoin(
        purchases,
        and(eq(purchaseMembers.purchaseId, purchases.id), eq(purchases.cardId, cardId)),
      )
      .where(
        sql`(${invoices.year} > ${targetYear} OR (${invoices.year} = ${targetYear} AND ${invoices.month} >= ${targetMonth}))`,
      )

    return result?.total ?? 0
  }

  async findMonthTotalAmount(
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
          eq(purchases.cardId, cardId),
          eq(invoices.month, targetMonth),
          eq(invoices.year, targetYear),
        ),
      )

    return result?.total ?? 0
  }

  // ─── Private helpers ──────────────────────────────────────────────────────────

  private countAnticipatableInstallments(
    currentInstallment: number,
    installmentsCount: number,
    targetMonth: number,
    targetYear: number,
    targetBill: { invoiceMonth: number; invoiceYear: number },
  ): number {
    for (let k = currentInstallment + 1; k <= installmentsCount; k++) {
      let m = targetMonth + (k - 1)
      let y = targetYear
      while (m > 11) {
        m -= 12
        y++
      }
      if (
        y > targetBill.invoiceYear ||
        (y === targetBill.invoiceYear && m > targetBill.invoiceMonth)
      ) {
        return installmentsCount - k + 1
      }
    }
    return 0
  }

  private mapPurchaseRows(
    rows: PurchaseRow[],
    targetMonth: number,
    targetYear: number,
    card: Pick<Card, 'dueDay' | 'closingOffsetDays' | 'anticipationMode'>,
  ): CardPurchase[] {
    const grouped = new Map<string, CardPurchase>()
    const memberMaps = new Map<string, Map<string, CardPurchaseMember>>()
    const targetBill = calculateInvoiceCompetence(new Date(), card.dueDay, card.closingOffsetDays)

    for (const { installment, pm, purchase, member } of rows) {
      const currentInstallment = installment.number
      const amount = Number(installment.amount)

      const isConsolidation =
        !!pm.anticipatedAt &&
        (pm.anticipateFromInstallment !== null
          ? installment.number === pm.anticipateFromInstallment
          : amount > pm.installmentAmount)

      let group = grouped.get(purchase.id)

      if (!group) {
        const anticipatableInstallments =
          card.anticipationMode === 'none' || pm.anticipatedAt
            ? 0
            : this.countAnticipatableInstallments(
                currentInstallment,
                purchase.installmentsCount,
                targetMonth,
                targetYear,
                targetBill,
              )

        const { consolidatedCount, remainingInstallments } = isConsolidation
          ? calculateConsolidation(
              amount,
              pm.installmentAmount,
              purchase.installmentsCount,
              currentInstallment,
            )
          : {
              consolidatedCount: 0,
              remainingInstallments: Math.max(purchase.installmentsCount - currentInstallment, 0),
            }

        group = {
          purchaseMemberId: pm.id,
          groupId: purchase.id,
          description: purchase.description,
          purchaseDate: purchase.purchaseDate,
          category: purchase.category,
          totalAmount: 0,
          installmentsCount: purchase.installmentsCount,
          elapsedInstallments: currentInstallment,
          remainingInstallments,
          anticipatedAt: isConsolidation ? (pm.anticipatedAt?.toISOString() ?? null) : null,
          anticipatedInstallmentsCount: isConsolidation ? consolidatedCount : null,
          anticipateFromInstallment: isConsolidation ? currentInstallment : null,
          anticipatableInstallments,
          subscriptionId: purchase.subscriptionId ?? null,
          members: [],
        }
        grouped.set(purchase.id, group)
        memberMaps.set(purchase.id, new Map())
      } else if (isConsolidation && !group.anticipatedAt) {
        const { consolidatedCount, remainingInstallments } = calculateConsolidation(
          amount,
          pm.installmentAmount,
          purchase.installmentsCount,
          currentInstallment,
        )
        group.anticipatedAt = pm.anticipatedAt?.toISOString() ?? null
        group.anticipatedInstallmentsCount = consolidatedCount
        group.anticipateFromInstallment = currentInstallment
        group.elapsedInstallments = currentInstallment
        group.remainingInstallments = remainingInstallments
      }

      group.totalAmount += amount

      // biome-ignore lint/style/noNonNullAssertion: set alongside group above
      const memberMap = memberMaps.get(purchase.id)!
      const existingMember = memberMap.get(member.id)
      if (existingMember) {
        existingMember.installmentAmount += amount
      } else {
        const newMember: CardPurchaseMember = {
          id: member.id,
          name: member.name,
          relationship: member.relationship,
          installmentAmount: amount,
          perInstallmentAmount:
            Number(pm.installmentAmount) ||
            Math.round(Number(pm.amount) / purchase.installmentsCount),
          totalOwed: Number(pm.amount),
        }
        memberMap.set(member.id, newMember)
        group.members.push(newMember)
      }
    }

    return Array.from(grouped.values()).filter(g => g.members.length > 0)
  }

  async findAnticipatedPurchaseMembers(cardId: string): Promise<{ id: string }[]> {
    return this.db
      .selectDistinct({ id: purchaseMembers.id })
      .from(purchaseMembers)
      .innerJoin(purchases, eq(purchaseMembers.purchaseId, purchases.id))
      .innerJoin(installments, eq(installments.purchaseMemberId, purchaseMembers.id))
      .where(and(eq(purchases.cardId, cardId), isNotNull(installments.anticipatedAt)))
  }

  async getAnticipationAnchor(
    pmId: string,
  ): Promise<{ month: number; year: number; count: number } | null> {
    const rows = await this.db
      .select({
        month: invoices.month,
        year: invoices.year,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(installments)
      .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
      .where(and(eq(installments.purchaseMemberId, pmId), isNotNull(installments.anticipatedAt)))
      .groupBy(invoices.month, invoices.year)
      .orderBy(sql`count(*) desc`)
    return rows[0] ?? null
  }

  async revertAnticipation(pmId: string): Promise<number> {
    const reverted = await this.db
      .update(installments)
      .set({
        invoiceId: sql`${installments.originalInvoiceId}`,
        anticipatedAt: null,
        originalInvoiceId: null,
      })
      .where(
        and(
          eq(installments.purchaseMemberId, pmId),
          isNotNull(installments.anticipatedAt),
          isNotNull(installments.originalInvoiceId),
        ),
      )
      .returning({ id: installments.id })
    await this.db
      .update(purchaseMembers)
      .set({ anticipatedAt: null, anticipateFromInstallment: null })
      .where(eq(purchaseMembers.id, pmId))
    return reverted.length
  }

  async reapplyAnticipation(params: {
    pmId: string
    mode: 'gap' | 'tail'
    count: number
    anchorMonth: number
    anchorYear: number
    cardId: string
  }): Promise<number> {
    const { pmId, mode, count, anchorMonth, anchorYear, cardId } = params

    const candidates = await this.db
      .select({ id: installments.id, number: installments.number })
      .from(installments)
      .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
      .where(
        and(
          eq(installments.purchaseMemberId, pmId),
          isNull(installments.paidAt),
          sql`(${invoices.year} > ${anchorYear} OR (${invoices.year} = ${anchorYear} AND ${invoices.month} > ${anchorMonth}))`,
        ),
      )
      .orderBy(installments.number)

    const selected =
      mode === 'tail' ? [...candidates].reverse().slice(0, count) : candidates.slice(0, count)
    if (selected.length === 0) return 0

    return this.db.transaction(async tx => {
      let [inv] = await tx
        .select({ id: invoices.id })
        .from(invoices)
        .where(
          and(
            eq(invoices.cardId, cardId),
            eq(invoices.month, anchorMonth),
            eq(invoices.year, anchorYear),
          ),
        )
      if (!inv) {
        const [created] = await tx
          .insert(invoices)
          .values({
            cardId,
            month: anchorMonth,
            year: anchorYear,
            dueDate: new Date(anchorYear, anchorMonth, 1),
          })
          .returning({ id: invoices.id })
        inv = created
      }
      await tx
        .update(installments)
        .set({
          invoiceId: inv.id,
          originalInvoiceId: sql`COALESCE(${installments.originalInvoiceId}, ${installments.invoiceId})`,
          anticipatedAt: new Date(),
        })
        .where(inArray(installments.id, selected.map(s => s.id)))
      await tx
        .update(purchaseMembers)
        .set({ anticipatedAt: new Date() })
        .where(eq(purchaseMembers.id, pmId))
      return selected.length
    })
  }

  async findInvoicePaymentSummary(
    cardId: string,
    targetMonth: number,
    targetYear: number,
  ): Promise<MemberPaymentSummary[]> {
    const ps = this.db
      .select({
        memberId: memberPayments.memberId,
        totalPaid: sql<number>`coalesce(sum(${memberPayments.amount}), 0)`.as('total_paid'),
      })
      .from(memberPayments)
      .where(
        and(
          eq(memberPayments.cardId, cardId),
          eq(memberPayments.targetMonth, targetMonth),
          eq(memberPayments.targetYear, targetYear),
        ),
      )
      .groupBy(memberPayments.memberId)
      .as('ps')

    const cs = this.db
      .select({
        memberId: memberCoverages.memberId,
        totalCovered: sql<number>`coalesce(sum(${memberCoverages.amount}), 0)`.as('total_covered'),
        coverageRepaid: sql<number>`coalesce(sum(${memberCoverages.amountRepaid}), 0)`.as('coverage_repaid'),
      })
      .from(memberCoverages)
      .where(
        and(
          eq(memberCoverages.cardId, cardId),
          eq(memberCoverages.targetMonth, targetMonth),
          eq(memberCoverages.targetYear, targetYear),
        ),
      )
      .groupBy(memberCoverages.memberId)
      .as('cs')

    const rows = await this.db
      .select({
        id: members.id,
        name: members.name,
        relationship: members.relationship,
        totalOwed: sql<number>`
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
        totalPaid: sql<number>`coalesce(max(${ps.totalPaid}), 0)`.mapWith(Number),
        totalCovered: sql<number>`coalesce(max(${cs.totalCovered}), 0)`.mapWith(Number),
        coverageRepaid: sql<number>`coalesce(max(${cs.coverageRepaid}), 0)`.mapWith(Number),
      })
      .from(installments)
      .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
      .innerJoin(purchaseMembers, eq(installments.purchaseMemberId, purchaseMembers.id))
      .innerJoin(purchases, eq(purchaseMembers.purchaseId, purchases.id))
      .innerJoin(members, eq(purchaseMembers.memberId, members.id))
      .leftJoin(ps, eq(ps.memberId, members.id))
      .leftJoin(cs, eq(cs.memberId, members.id))
      .where(
        and(
          eq(purchases.cardId, cardId),
          eq(invoices.month, targetMonth),
          eq(invoices.year, targetYear),
        ),
      )
      .groupBy(members.id, members.name, members.relationship)

    return rows.map(row => {
      const hasAnyRecord = row.totalPaid > 0 || row.totalCovered > 0
      const effectivePaid = row.totalPaid + row.coverageRepaid
      return {
        id: row.id,
        name: row.name,
        relationship: row.relationship,
        totalOwed: row.totalOwed,
        totalPaid: row.totalPaid,
        remaining: hasAnyRecord ? Math.max(row.totalOwed - row.totalPaid, 0) : 0,
        isLate: hasAnyRecord ? row.totalOwed > effectivePaid : null,
      }
    })
  }

}
