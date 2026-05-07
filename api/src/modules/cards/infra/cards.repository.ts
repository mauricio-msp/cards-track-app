import { and, eq, isNull, sql } from 'drizzle-orm'
import { uuidv7 } from 'uuidv7'
import type { db as Db } from '@/db'
import { cards, debts, installments, invoices, members, subscriptions } from '@/db/schema'
import type {
  CardDebt,
  ICardsRepository,
} from '@/modules/cards/domain/repositories/cards.repository.interface'
import type { Card, CreateCardInput, UpdateCardInput } from '@/modules/cards/http/dto/cards.dto'
import { calculateInvoiceCompetence } from '@/utils/calculate-invoice-competence'

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
      .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
      .where(and(eq(invoices.cardId, cardId), isNull(installments.paidAt)))
      .limit(1)

    return !!check
  }

  async findDebts(
    cardId: string,
    card: Pick<Card, 'dueDay' | 'closingOffsetDays'>,
    targetMonth: number,
    targetYear: number,
  ): Promise<CardDebt[]> {
    // Auto-generate subscription debts for the queried period
    const activeSubscriptions = await this.db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.cardId, cardId), eq(subscriptions.active, true)))

    for (const sub of activeSubscriptions) {
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
        .select({ id: debts.id })
        .from(debts)
        .where(
          and(
            eq(debts.subscriptionId, sub.id),
            eq(debts.invoiceMonth, invoiceMonth),
            eq(debts.invoiceYear, invoiceYear),
          ),
        )

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

      const groupId = uuidv7()

      const [newDebt] = await this.db
        .insert(debts)
        .values({
          groupId,
          cardId,
          memberId: sub.memberId,
          invoiceId: invoice.id,
          description: sub.name,
          category: 'Assinatura',
          amount: sub.amount,
          installmentsCount: 1,
          installmentsAmount: sub.amount,
          purchaseDate: purchaseDateStr,
          invoiceMonth,
          invoiceYear,
          startInstallment: 1,
          endInstallment: 1,
          subscriptionId: sub.id,
        })
        .returning()

      await this.db.insert(installments).values({
        debtId: newDebt.id,
        memberId: sub.memberId,
        invoiceId: invoice.id,
        number: 1,
        amount: sub.amount,
      })
    }

    const rows = await this.db
      .select({
        debt: debts,
        member: members,
        installment: installments,
      })
      .from(installments)
      .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
      .innerJoin(debts, eq(installments.debtId, debts.id))
      .innerJoin(members, eq(installments.memberId, members.id))
      .where(
        and(
          eq(invoices.cardId, cardId),
          eq(invoices.month, targetMonth),
          eq(invoices.year, targetYear),
        ),
      )

    const grouped = new Map<string, CardDebt>()
    const targetBill = calculateInvoiceCompetence(new Date(), card.dueDay, card.closingOffsetDays)

    for (const { installment, debt, member } of rows) {
      const currentInstallment = installment.number
      const start = debt.startInstallment
      const end = debt.endInstallment ?? debt.installmentsCount

      if (currentInstallment < start || currentInstallment > end) continue

      const amount = Number(installment.amount)

      // Identify if this installment is the consolidated/anticipated one.
      // For new records: use stored anticipateFromInstallment.
      // For legacy records (column is null): fall back to amount comparison.
      const isConsolidation =
        !!debt.anticipatedAt &&
        (debt.anticipateFromInstallment !== null
          ? installment.number === debt.anticipateFromInstallment
          : amount > debt.installmentsAmount)

      let group = grouped.get(debt.groupId)

      if (!group) {
        // Compute anticipatable installments mathematically (installments strictly after target invoice)
        let anticipatableInstallments = 0
        if (!debt.anticipatedAt) {
          let firstAnticipatable: number | null = null
          for (let k = currentInstallment + 1; k <= debt.installmentsCount; k++) {
            let m = debt.invoiceMonth + (k - 1)
            let y = debt.invoiceYear
            while (m > 11) {
              m -= 12
              y++
            }
            if (
              y > targetBill.invoiceYear ||
              (y === targetBill.invoiceYear && m > targetBill.invoiceMonth)
            ) {
              firstAnticipatable = k
              break
            }
          }
          anticipatableInstallments =
            firstAnticipatable !== null ? debt.installmentsCount - firstAnticipatable + 1 : 0
        }

        const rawConsolidatedCount = isConsolidation && debt.installmentsAmount > 0
          ? Math.round(Number(installment.amount) / debt.installmentsAmount)
          : 0
        const consolidatedCount = Number.isFinite(rawConsolidatedCount) && rawConsolidatedCount > 0
          ? rawConsolidatedCount
          : isConsolidation ? debt.installmentsCount - currentInstallment + 1 : 0
        const anticipatedCount = consolidatedCount
        const remainingInstallments = isConsolidation
          ? Math.max(debt.installmentsCount - (currentInstallment + consolidatedCount - 1), 0)
          : Math.max(debt.installmentsCount - currentInstallment, 0)

        group = {
          debtId: debt.id,
          groupId: debt.groupId,
          description: debt.description,
          purchaseDate: debt.purchaseDate,
          category: debt.category,
          totalAmount: 0,
          installmentsCount: debt.installmentsCount,
          elapsedInstallments: currentInstallment,
          remainingInstallments,
          anticipatedAt: isConsolidation ? (debt.anticipatedAt?.toISOString() ?? null) : null,
          anticipatedInstallmentsCount: isConsolidation ? anticipatedCount : null,
          anticipateFromInstallment: isConsolidation ? currentInstallment : null,
          anticipatableInstallments,
          subscriptionId: debt.subscriptionId ?? null,
          members: [],
        }
        grouped.set(debt.groupId, group)
      } else if (isConsolidation && !group.anticipatedAt) {
        // Same debt has a regular installment AND the consolidation in the same month.
        // Update the group to reflect the anticipation now that we found the consolidated installment.
        const rawCount = debt.installmentsAmount > 0 ? Math.round(amount / debt.installmentsAmount) : 0
        const consolidatedCount = Number.isFinite(rawCount) && rawCount > 0
          ? rawCount
          : debt.installmentsCount - currentInstallment + 1
        group.anticipatedAt = debt.anticipatedAt?.toISOString() ?? null
        group.anticipatedInstallmentsCount = consolidatedCount
        group.anticipateFromInstallment = currentInstallment
        group.elapsedInstallments = currentInstallment
        group.remainingInstallments = Math.max(
          debt.installmentsCount - (currentInstallment + consolidatedCount - 1),
          0,
        )
      }

      group.totalAmount += amount

      // Deduplicate members when the same member appears across multiple installments in the same month
      const existingMember = group.members.find(m => m.id === member.id)
      if (existingMember) {
        existingMember.installmentAmount += amount
      } else {
        group.members.push({
          id: member.id,
          name: member.name,
          relationship: member.relationship,
          installmentAmount: amount,
          perInstallmentAmount:
            Number(debt.installmentsAmount) ||
            Math.round(Number(debt.amount) / debt.installmentsCount),
        })
      }
    }

    return Array.from(grouped.values()).filter(g => g.members.length > 0)
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
      .where(
        and(
          eq(invoices.cardId, cardId),
          sql`(${invoices.year} > ${targetYear} OR (${invoices.year} = ${targetYear} AND ${invoices.month} >= ${targetMonth}))`,
        ),
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
                WHEN ${installments.number} >= ${debts.startInstallment}
                  AND ${installments.number} <= COALESCE(${debts.endInstallment}, ${debts.installmentsCount})
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
      .innerJoin(debts, eq(installments.debtId, debts.id))
      .where(
        and(
          eq(invoices.cardId, cardId),
          eq(invoices.month, targetMonth),
          eq(invoices.year, targetYear),
        ),
      )

    return result?.total ?? 0
  }
}
