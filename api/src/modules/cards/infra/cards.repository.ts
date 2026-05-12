import { and, eq, isNull, sql } from 'drizzle-orm'
import { uuidv7 } from 'uuidv7'
import type { db as Db } from '@/db'
import { cards, installments, invoices, members, purchaseMembers, purchases, subscriptions } from '@/db/schema'
import type {
  CardPurchase,
  CardPurchaseMember,
  ICardsRepository,
} from '@/modules/cards/domain/repositories/cards.repository.interface'
import type { Card, CreateCardInput, UpdateCardInput } from '@/modules/cards/http/dto/cards.dto'
import { calculateInvoiceCompetence } from '@/utils/calculate-invoice-competence'

type PurchaseRow = {
  pm: typeof purchaseMembers.$inferSelect
  purchase: typeof purchases.$inferSelect
  member: typeof members.$inferSelect
  installment: typeof installments.$inferSelect
}

type ConsolidationResult = {
  consolidatedCount: number
  remainingInstallments: number
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

  async findAll(
    userId: string,
  ): Promise<Pick<Card, 'id' | 'name' | 'limit' | 'closingOffsetDays' | 'dueDay'>[]> {
    return this.db
      .select({
        id: cards.id,
        name: cards.name,
        limit: cards.limit,
        closingOffsetDays: cards.closingOffsetDays,
        dueDay: cards.dueDay,
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
        ownerUserId: userId,
      })
      .returning()

    return card
  }

  async update(id: string, data: UpdateCardInput): Promise<void> {
    await this.db
      .update(cards)
      .set({ limit: data.limit, closingOffsetDays: data.closingOffsetDays, dueDay: data.dueDay })
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
      .innerJoin(purchases, and(eq(purchaseMembers.purchaseId, purchases.id), eq(purchases.cardId, cardId)))
      .where(isNull(installments.paidAt))
      .limit(1)

    return !!check
  }

  async findPurchases(
    cardId: string,
    card: Pick<Card, 'dueDay' | 'closingOffsetDays'>,
    targetMonth: number,
    targetYear: number,
  ): Promise<CardPurchase[]> {
    await this.ensureSubscriptionPurchases(cardId, card, targetMonth, targetYear)

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
      .innerJoin(purchases, and(eq(purchaseMembers.purchaseId, purchases.id), eq(purchases.cardId, cardId)))
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

  private resolveConsolidation(
    amount: number,
    pmInstallmentAmount: number,
    installmentsCount: number,
    currentInstallment: number,
  ): ConsolidationResult {
    const rawCount =
      pmInstallmentAmount > 0 ? Math.round(amount / pmInstallmentAmount) : 0
    const consolidatedCount =
      Number.isFinite(rawCount) && rawCount > 0
        ? rawCount
        : installmentsCount - currentInstallment + 1
    return {
      consolidatedCount,
      remainingInstallments: Math.max(
        installmentsCount - (currentInstallment + consolidatedCount - 1),
        0,
      ),
    }
  }

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
      while (m > 11) { m -= 12; y++ }
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
    card: Pick<Card, 'dueDay' | 'closingOffsetDays'>,
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
        const anticipatableInstallments = pm.anticipatedAt
          ? 0
          : this.countAnticipatableInstallments(
              currentInstallment,
              purchase.installmentsCount,
              targetMonth,
              targetYear,
              targetBill,
            )

        const { consolidatedCount, remainingInstallments } = isConsolidation
          ? this.resolveConsolidation(
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
        const { consolidatedCount, remainingInstallments } = this.resolveConsolidation(
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
        }
        memberMap.set(member.id, newMember)
        group.members.push(newMember)
      }
    }

    return Array.from(grouped.values()).filter(g => g.members.length > 0)
  }

  // Ensures subscription purchases exist for the queried period before reading.
  // TODO: move to a scheduled job — this write side-effect runs on every GET /cards/:id/purchases.
  private async ensureSubscriptionPurchases(
    cardId: string,
    card: Pick<Card, 'dueDay' | 'closingOffsetDays'>,
    targetMonth: number,
    targetYear: number,
  ): Promise<void> {
    const activeSubs = await this.db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.cardId, cardId), eq(subscriptions.active, true)))

    for (const sub of activeSubs) {
      const actualMonth = targetMonth + 1
      const lastDayOfMonth = new Date(targetYear, actualMonth, 0).getDate()
      const day = Math.min(sub.billingDay, lastDayOfMonth)
      const purchaseDateStr = `${targetYear}-${String(actualMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const purchaseDate = new Date(`${purchaseDateStr}T00:00:00`)

      const { invoiceMonth, invoiceYear } = calculateInvoiceCompetence(
        purchaseDate,
        card.dueDay,
        card.closingOffsetDays,
      )

      if (invoiceMonth !== targetMonth || invoiceYear !== targetYear) continue

      const [existing] = await this.db
        .select({ id: purchases.id })
        .from(purchases)
        .innerJoin(
          invoices,
          and(
            eq(purchases.invoiceId, invoices.id),
            eq(invoices.month, invoiceMonth),
            eq(invoices.year, invoiceYear),
          ),
        )
        .where(eq(purchases.subscriptionId, sub.id))
        .limit(1)

      if (existing) continue

      let [invoice] = await this.db
        .select()
        .from(invoices)
        .where(
          and(
            eq(invoices.cardId, cardId),
            eq(invoices.month, invoiceMonth),
            eq(invoices.year, invoiceYear),
          ),
        )

      if (!invoice) {
        const dueDate = new Date(invoiceYear, invoiceMonth, card.dueDay)
        const [newInv] = await this.db
          .insert(invoices)
          .values({ cardId, month: invoiceMonth, year: invoiceYear, dueDate })
          .returning()
        invoice = newInv
      }

      const purchaseId = uuidv7()
      const [newPurchase] = await this.db
        .insert(purchases)
        .values({
          id: purchaseId,
          cardId,
          invoiceId: invoice.id,
          subscriptionId: sub.id,
          description: sub.name,
          category: 'Assinatura',
          purchaseDate: purchaseDateStr,
          installmentsCount: 1,
        })
        .returning()

      const [pm] = await this.db
        .insert(purchaseMembers)
        .values({
          purchaseId: newPurchase.id,
          memberId: sub.memberId,
          amount: sub.amount,
          installmentAmount: sub.amount,
          startInstallment: 1,
          endInstallment: 1,
        })
        .returning()

      await this.db.insert(installments).values({
        purchaseMemberId: pm.id,
        debtId: pm.id,
        invoiceId: invoice.id,
        memberId: sub.memberId,
        number: 1,
        amount: sub.amount,
      })
    }
  }
}
