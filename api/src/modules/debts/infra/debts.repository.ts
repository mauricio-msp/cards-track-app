import { and, eq, gt, inArray, isNull, lte, sql } from 'drizzle-orm'
import { uuidv7 } from 'uuidv7'
import type { db as Db } from '@/db'
import { cards, debts, installments, invoices, members, subscriptions } from '@/db/schema'
import type {
  CardAmountRow,
  ChartDataRow,
  DebtCard,
  DebtWithCard,
  IDebtsRepository,
} from '@/modules/debts/domain/repositories/debts.repository.interface'
import type { CreateDebtInput } from '@/modules/debts/http/dto/debts.dto'
import { calculateInvoiceCompetence } from '@/utils/calculate-invoice-competence'

export class DebtsRepository implements IDebtsRepository {
  constructor(private readonly db: typeof Db) {}

  async findCardByOwner(cardId: string, userId: string): Promise<DebtCard | null> {
    const [card] = await this.db
      .select({
        id: cards.id,
        limit: cards.limit,
        closingOffsetDays: cards.closingOffsetDays,
        dueDay: cards.dueDay,
      })
      .from(cards)
      .where(and(eq(cards.id, cardId), eq(cards.ownerUserId, userId)))

    return card ?? null
  }

  async findActiveMembers(memberIds: string[]): Promise<{ id: string }[]> {
    return this.db
      .select({ id: members.id })
      .from(members)
      .where(and(inArray(members.id, memberIds), isNull(members.deletedAt)))
  }

  async getTotalUnpaid(cardId: string, targetMonth: number, targetYear: number): Promise<number> {
    const [result] = await this.db
      .select({
        totalUnpaid: sql<number>`COALESCE(SUM(${installments.amount}), 0)`.mapWith(Number),
      })
      .from(installments)
      .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
      .where(
        and(
          eq(invoices.cardId, cardId),
          sql`(${invoices.year} > ${targetYear} OR (${invoices.year} = ${targetYear} AND ${invoices.month} >= ${targetMonth}))`,
        ),
      )

    return result?.totalUnpaid ?? 0
  }

  async createDebtTransaction(
    data: CreateDebtInput,
    card: DebtCard,
    groupId: string,
    invoiceMonth: number,
    invoiceYear: number,
    purchaseDateResetHours: Date,
    userId: string,
  ): Promise<(typeof debts.$inferSelect)[]> {
    const {
      cardId,
      members: members_input,
      description,
      category,
      installmentsCount,
      isRecurring,
      billingDay,
    } = data

    return this.db.transaction(async tx => {
      let [firstInvoice] = await tx
        .select()
        .from(invoices)
        .where(
          and(
            eq(invoices.cardId, cardId),
            eq(invoices.month, invoiceMonth),
            eq(invoices.year, invoiceYear),
          ),
        )

      if (!firstInvoice) {
        const dueDate = new Date(invoiceYear, invoiceMonth, card.dueDay)
        const [newInv] = await tx
          .insert(invoices)
          .values({ cardId, month: invoiceMonth, year: invoiceYear, dueDate })
          .returning()
        firstInvoice = newInv
      }

      const memberSubscriptionMap: Record<string, string> = {}

      if (isRecurring && billingDay) {
        for (const member of members_input) {
          const memberAmount = Math.round(member.amount / installmentsCount)
          const [sub] = await tx
            .insert(subscriptions)
            .values({
              userId,
              cardId,
              memberId: member.id,
              name: description,
              amount: memberAmount,
              billingDay,
            })
            .returning({ id: subscriptions.id })
          memberSubscriptionMap[member.id] = sub.id
        }
      }

      const debtsToInsert = members_input.map(member => {
        const start = member.startInstallment ?? 1
        const end = member.endInstallment ?? installmentsCount
        const memberActiveInstallments = end - start + 1

        if (memberActiveInstallments <= 0 || end > installmentsCount) {
          throw new Error(`Intervalo de parcelas inválido para o membro ${member.name}`)
        }

        const singleInstallmentValue = Math.round(member.amount / installmentsCount)
        const totalMemberAmount = singleInstallmentValue * memberActiveInstallments

        return {
          groupId,
          cardId,
          memberId: member.id,
          invoiceId: firstInvoice.id,
          description,
          category,
          amount: totalMemberAmount,
          installmentsCount,
          installmentsAmount: singleInstallmentValue,
          purchaseDate: purchaseDateResetHours.toISOString(),
          invoiceMonth,
          invoiceYear,
          startInstallment: start,
          endInstallment: end,
          subscriptionId: memberSubscriptionMap[member.id] ?? null,
        }
      })

      const insertedDebts = await tx.insert(debts).values(debtsToInsert).returning()

      for (const debt of insertedDebts) {
        const start = debt.startInstallment ?? 1
        const end = debt.endInstallment ?? installmentsCount

        for (let i = 0; i < installmentsCount; i++) {
          const currentInstallmentNum = i + 1

          if (currentInstallmentNum < start || currentInstallmentNum > end) continue

          let m = invoiceMonth + i
          let y = invoiceYear
          while (m > 11) {
            m -= 12
            y++
          }

          let [invoice] = await tx
            .select()
            .from(invoices)
            .where(and(eq(invoices.cardId, cardId), eq(invoices.month, m), eq(invoices.year, y)))

          if (!invoice) {
            const dueDate = new Date(y, m, card.dueDay)
            const [newInv] = await tx
              .insert(invoices)
              .values({ id: uuidv7(), cardId, month: m, year: y, dueDate })
              .returning()
            invoice = newInv
          }

          await tx.insert(installments).values({
            debtId: debt.id,
            memberId: debt.memberId,
            invoiceId: invoice.id,
            number: currentInstallmentNum,
            amount: debt.installmentsAmount,
          })
        }
      }

      return insertedDebts
    })
  }

  async findDebtGroupByIdAndOwner(
    debtId: string,
    userId: string,
  ): Promise<{ groupId: string } | null> {
    const [row] = await this.db
      .select({ groupId: debts.groupId })
      .from(debts)
      .innerJoin(cards, and(eq(debts.cardId, cards.id), eq(cards.ownerUserId, userId)))
      .where(eq(debts.id, debtId))
      .limit(1)

    return row ?? null
  }

  async deleteByGroupId(groupId: string): Promise<void> {
    await this.db.delete(debts).where(eq(debts.groupId, groupId))
  }

  async findDebtByIdAndMemberAndOwner(
    debtId: string,
    memberId: string,
    userId: string,
  ): Promise<{ id: string } | null> {
    const [row] = await this.db
      .select({ id: debts.id })
      .from(debts)
      .innerJoin(cards, and(eq(debts.cardId, cards.id), eq(cards.ownerUserId, userId)))
      .where(and(eq(debts.id, debtId), eq(debts.memberId, memberId)))
      .limit(1)

    return row ?? null
  }

  async deleteById(id: string): Promise<void> {
    await this.db.delete(debts).where(eq(debts.id, id))
  }

  async findDebtWithCardByOwner(debtId: string, userId: string): Promise<DebtWithCard | null> {
    const [row] = await this.db
      .select({
        id: debts.id,
        groupId: debts.groupId,
        cardId: debts.cardId,
        memberId: debts.memberId,
        installmentsCount: debts.installmentsCount,
        installmentsAmount: debts.installmentsAmount,
        anticipatedAt: debts.anticipatedAt,
        card: { dueDay: cards.dueDay, closingOffsetDays: cards.closingOffsetDays },
      })
      .from(debts)
      .innerJoin(cards, and(eq(debts.cardId, cards.id), eq(cards.ownerUserId, userId)))
      .where(eq(debts.id, debtId))
      .limit(1)

    return row ?? null
  }

  async countDebtsByGroupId(groupId: string): Promise<number> {
    const [{ count }] = await this.db
      .select({ count: sql<number>`COUNT(*)`.mapWith(Number) })
      .from(debts)
      .where(eq(debts.groupId, groupId))

    return count
  }

  async findUnpaidInstallmentNumbers(
    debtId: string,
  ): Promise<{ number: number; invoiceMonth: number; invoiceYear: number }[]> {
    return this.db
      .select({
        number: installments.number,
        invoiceMonth: invoices.month,
        invoiceYear: invoices.year,
      })
      .from(installments)
      .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
      .where(and(eq(installments.debtId, debtId), isNull(installments.paidAt)))
      .orderBy(installments.number)
  }

  async anticipateInstallments(params: {
    debtId: string
    memberId: string
    cardId: string
    dueDay: number
    closingOffsetDays: number
    anticipateFromInstallment: number
    anticipateCount: number
    anticipatedAmount: number
  }): Promise<void> {
    const { debtId, memberId, cardId, dueDay, closingOffsetDays, anticipateFromInstallment, anticipateCount, anticipatedAmount } =
      params

    const anticipateToInstallment = anticipateFromInstallment + anticipateCount - 1

    await this.db.transaction(async tx => {
      await tx
        .delete(installments)
        .where(
          and(
            eq(installments.debtId, debtId),
            sql`${installments.number} >= ${anticipateFromInstallment}`,
            lte(installments.number, anticipateToInstallment),
          ),
        )

      const { invoiceMonth, invoiceYear } = calculateInvoiceCompetence(new Date(), dueDay, closingOffsetDays)

      let [currentInvoice] = await tx
        .select()
        .from(invoices)
        .where(
          and(
            eq(invoices.cardId, cardId),
            eq(invoices.month, invoiceMonth),
            eq(invoices.year, invoiceYear),
          ),
        )

      if (!currentInvoice) {
        const dueDate = new Date(invoiceYear, invoiceMonth, dueDay)
        const [newInvoice] = await tx
          .insert(invoices)
          .values({ cardId, month: invoiceMonth, year: invoiceYear, dueDate })
          .returning()
        currentInvoice = newInvoice
      }

      await tx.insert(installments).values({
        debtId,
        memberId,
        invoiceId: currentInvoice.id,
        number: anticipateFromInstallment,
        amount: anticipatedAmount,
      })

      await tx
        .update(debts)
        .set({ anticipatedAt: new Date(), anticipateFromInstallment })
        .where(eq(debts.id, debtId))
    })
  }

  async getDebtsTrend(userId: string, year: number): Promise<ChartDataRow[]> {
    return this.db
      .select({
        cardName: cards.name,
        month: invoices.month,
        total: sql<number>`COALESCE(SUM(${installments.amount}), 0)`.mapWith(Number),
      })
      .from(installments)
      .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
      .innerJoin(cards, eq(invoices.cardId, cards.id))
      .where(and(eq(cards.ownerUserId, userId), eq(invoices.year, year)))
      .groupBy(cards.name, invoices.month)
      .orderBy(invoices.month)
  }

  async getDebtsYears(userId: string): Promise<number[]> {
    const result = await this.db
      .select({ year: invoices.year })
      .from(invoices)
      .innerJoin(cards, eq(invoices.cardId, cards.id))
      .where(eq(cards.ownerUserId, userId))
      .groupBy(invoices.year)
      .orderBy(sql`${invoices.year} DESC`)

    return result.map(r => r.year)
  }

  async getMonthCardAmounts(userId: string, month: number, year: number): Promise<CardAmountRow[]> {
    return this.db
      .select({
        cardId: cards.id,
        cardName: cards.name,
        total: sql<number>`sum(${installments.amount})`.mapWith(Number),
      })
      .from(installments)
      .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
      .innerJoin(cards, eq(invoices.cardId, cards.id))
      .where(and(eq(cards.ownerUserId, userId), eq(invoices.month, month), eq(invoices.year, year)))
      .groupBy(cards.id, cards.name)
  }

  async getMonthTotalDebtsAmount(
    userId: string,
    month: number,
    year: number,
    today: number,
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
      .innerJoin(cards, eq(invoices.cardId, cards.id))
      .where(
        and(
          eq(cards.ownerUserId, userId),
          eq(invoices.month, month),
          eq(invoices.year, year),
          gt(cards.dueDay, today),
        ),
      )

    return result?.total ?? 0
  }

  async getTotalDebtsAmount(userId: string): Promise<number> {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    const today = now.getDate()

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
      .innerJoin(cards, and(eq(invoices.cardId, cards.id), eq(cards.ownerUserId, userId)))
      .innerJoin(members, and(eq(installments.memberId, members.id), eq(members.userId, userId)))
      .where(
        sql`
          (${invoices.year} > ${currentYear}) OR
          (${invoices.year} = ${currentYear} AND ${invoices.month} > ${currentMonth}) OR
          (${invoices.year} = ${currentYear} AND ${invoices.month} = ${currentMonth} AND ${cards.dueDay} >= ${today})
        `,
      )

    return result?.total ?? 0
  }
}
