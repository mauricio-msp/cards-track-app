import { and, eq, inArray, isNull, lte, sql } from 'drizzle-orm'
import { uuidv7 } from 'uuidv7'
import type { db as Db } from '@/db'
import { cards, installments, invoices, members, purchaseMembers, purchases, subscriptions } from '@/db/schema'
import type {
  IPurchasesRepository,
  PurchaseCard,
  PurchaseCreateResult,
  PurchaseMemberWithCard,
} from '@/modules/purchases/domain/repositories/purchases.repository.interface'
import type { CreatePurchaseInput } from '@/modules/purchases/http/dto/purchases.dto'
import { calculateInvoiceCompetence } from '@/utils/calculate-invoice-competence'

export class PurchasesRepository implements IPurchasesRepository {
  constructor(private readonly db: typeof Db) {}

  async findCardByOwner(cardId: string, userId: string): Promise<PurchaseCard | null> {
    const [card] = await this.db
      .select({ id: cards.id, limit: cards.limit, closingOffsetDays: cards.closingOffsetDays, dueDay: cards.dueDay })
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
      .select({ total: sql<number>`COALESCE(SUM(${installments.amount}), 0)`.mapWith(Number) })
      .from(installments)
      .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
      .innerJoin(purchaseMembers, eq(installments.purchaseMemberId, purchaseMembers.id))
      .innerJoin(purchases, and(eq(purchaseMembers.purchaseId, purchases.id), eq(purchases.cardId, cardId)))
      .where(sql`(${invoices.year} > ${targetYear} OR (${invoices.year} = ${targetYear} AND ${invoices.month} >= ${targetMonth}))`)
    return result?.total ?? 0
  }

  async createPurchase(
    data: CreatePurchaseInput,
    card: PurchaseCard,
    invoiceMonth: number,
    invoiceYear: number,
    purchaseDateResetHours: Date,
    userId: string,
  ): Promise<PurchaseCreateResult> {
    const { cardId, members: membersInput, description, category, installmentsCount, isRecurring, billingDay } = data

    return this.db.transaction(async tx => {
      let [firstInvoice] = await tx
        .select()
        .from(invoices)
        .where(and(eq(invoices.cardId, cardId), eq(invoices.month, invoiceMonth), eq(invoices.year, invoiceYear)))

      if (!firstInvoice) {
        const [newInv] = await tx
          .insert(invoices)
          .values({ cardId, month: invoiceMonth, year: invoiceYear, dueDate: new Date(invoiceYear, invoiceMonth, card.dueDay) })
          .returning()
        firstInvoice = newInv
      }

      const memberSubscriptionMap: Record<string, string> = {}
      if (isRecurring && billingDay) {
        for (const member of membersInput) {
          const [sub] = await tx
            .insert(subscriptions)
            .values({ userId, cardId, memberId: member.id, name: description, amount: Math.round(member.amount / installmentsCount), billingDay })
            .returning({ id: subscriptions.id })
          memberSubscriptionMap[member.id] = sub.id
        }
      }

      const purchaseId = uuidv7()
      const [purchase] = await tx
        .insert(purchases)
        .values({
          id: purchaseId,
          cardId,
          invoiceId: firstInvoice.id,
          subscriptionId: isRecurring && billingDay ? (memberSubscriptionMap[membersInput[0].id] ?? null) : null,
          description,
          category: category ?? null,
          purchaseDate: purchaseDateResetHours.toISOString().split('T')[0],
          installmentsCount,
        })
        .returning()

      const createdMembers: PurchaseCreateResult['members'] = []

      for (const member of membersInput) {
        const start = member.startInstallment ?? 1
        const end = member.endInstallment ?? installmentsCount
        const activeCount = end - start + 1

        if (activeCount <= 0 || end > installmentsCount) {
          throw new Error(`Intervalo de parcelas inválido para o membro ${member.name}`)
        }

        const singleValue = Math.round(member.amount / installmentsCount)
        const totalAmount = singleValue * activeCount

        const [pm] = await tx
          .insert(purchaseMembers)
          .values({ purchaseId, memberId: member.id, amount: totalAmount, installmentAmount: singleValue, startInstallment: start, endInstallment: end })
          .returning()

        const installmentRows: Array<typeof installments.$inferInsert> = []

        for (let i = 0; i < installmentsCount; i++) {
          const num = i + 1
          if (num < start || num > end) continue

          let m = invoiceMonth + i
          let y = invoiceYear
          while (m > 11) { m -= 12; y++ }

          let [inv] = await tx
            .select()
            .from(invoices)
            .where(and(eq(invoices.cardId, cardId), eq(invoices.month, m), eq(invoices.year, y)))

          if (!inv) {
            const [newInv] = await tx
              .insert(invoices)
              .values({ id: uuidv7(), cardId, month: m, year: y, dueDate: new Date(y, m, card.dueDay) })
              .returning()
            inv = newInv
          }

          installmentRows.push({
            purchaseMemberId: pm.id,
            debtId: pm.id,
            invoiceId: inv.id,
            memberId: member.id,
            number: num,
            amount: singleValue,
          })
        }

        if (installmentRows.length > 0) {
          await tx.insert(installments).values(installmentRows)
        }

        createdMembers.push({
          purchaseMemberId: pm.id,
          memberId: pm.memberId,
          amount: pm.amount,
          installmentAmount: pm.installmentAmount,
          startInstallment: pm.startInstallment,
          endInstallment: pm.endInstallment ?? null,
        })
      }

      return {
        purchaseId: purchase.id,
        cardId: purchase.cardId,
        description: purchase.description,
        category: purchase.category,
        purchaseDate: purchase.purchaseDate,
        installmentsCount: purchase.installmentsCount,
        members: createdMembers,
      }
    })
  }

  async findPurchaseMemberByIdAndOwner(pmId: string, userId: string): Promise<{ purchaseId: string } | null> {
    const [row] = await this.db
      .select({ purchaseId: purchaseMembers.purchaseId })
      .from(purchaseMembers)
      .innerJoin(purchases, eq(purchaseMembers.purchaseId, purchases.id))
      .innerJoin(cards, and(eq(purchases.cardId, cards.id), eq(cards.ownerUserId, userId)))
      .where(eq(purchaseMembers.id, pmId))
      .limit(1)
    return row ?? null
  }

  async deletePurchase(purchaseId: string): Promise<void> {
    await this.db.delete(purchases).where(eq(purchases.id, purchaseId))
  }

  async findPurchaseMemberByIdMemberAndOwner(pmId: string, memberId: string, userId: string): Promise<{ id: string } | null> {
    const [row] = await this.db
      .select({ id: purchaseMembers.id })
      .from(purchaseMembers)
      .innerJoin(purchases, eq(purchaseMembers.purchaseId, purchases.id))
      .innerJoin(cards, and(eq(purchases.cardId, cards.id), eq(cards.ownerUserId, userId)))
      .where(and(eq(purchaseMembers.id, pmId), eq(purchaseMembers.memberId, memberId)))
      .limit(1)
    return row ?? null
  }

  async deletePurchaseMember(pmId: string): Promise<void> {
    await this.db.delete(purchaseMembers).where(eq(purchaseMembers.id, pmId))
  }

  async findPurchaseMemberWithCard(pmId: string, userId: string): Promise<PurchaseMemberWithCard | null> {
    const [row] = await this.db
      .select({
        id: purchaseMembers.id,
        purchaseId: purchaseMembers.purchaseId,
        cardId: purchases.cardId,
        memberId: purchaseMembers.memberId,
        installmentsCount: purchases.installmentsCount,
        installmentAmount: purchaseMembers.installmentAmount,
        anticipatedAt: purchaseMembers.anticipatedAt,
        card: { dueDay: cards.dueDay, closingOffsetDays: cards.closingOffsetDays },
      })
      .from(purchaseMembers)
      .innerJoin(purchases, eq(purchaseMembers.purchaseId, purchases.id))
      .innerJoin(cards, and(eq(purchases.cardId, cards.id), eq(cards.ownerUserId, userId)))
      .where(eq(purchaseMembers.id, pmId))
      .limit(1)
    return row ?? null
  }

  async countPurchaseMembers(purchaseId: string): Promise<number> {
    const [{ count }] = await this.db
      .select({ count: sql<number>`COUNT(*)`.mapWith(Number) })
      .from(purchaseMembers)
      .where(eq(purchaseMembers.purchaseId, purchaseId))
    return count
  }

  async findUnpaidInstallments(pmId: string): Promise<{ number: number; invoiceMonth: number; invoiceYear: number }[]> {
    return this.db
      .select({ number: installments.number, invoiceMonth: invoices.month, invoiceYear: invoices.year })
      .from(installments)
      .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
      .where(and(eq(installments.purchaseMemberId, pmId), isNull(installments.paidAt)))
      .orderBy(installments.number)
  }

  async anticipateInstallments(params: {
    pmId: string
    memberId: string
    cardId: string
    dueDay: number
    closingOffsetDays: number
    anticipateFromInstallment: number
    anticipateCount: number
    anticipatedAmount: number
  }): Promise<void> {
    const { pmId, memberId, cardId, dueDay, closingOffsetDays, anticipateFromInstallment, anticipateCount, anticipatedAmount } = params
    const anticipateToInstallment = anticipateFromInstallment + anticipateCount - 1

    await this.db.transaction(async tx => {
      await tx
        .delete(installments)
        .where(and(
          eq(installments.purchaseMemberId, pmId),
          sql`${installments.number} >= ${anticipateFromInstallment}`,
          lte(installments.number, anticipateToInstallment),
        ))

      const { invoiceMonth, invoiceYear } = calculateInvoiceCompetence(new Date(), dueDay, closingOffsetDays)

      let [inv] = await tx
        .select()
        .from(invoices)
        .where(and(eq(invoices.cardId, cardId), eq(invoices.month, invoiceMonth), eq(invoices.year, invoiceYear)))

      if (!inv) {
        const [newInv] = await tx
          .insert(invoices)
          .values({ cardId, month: invoiceMonth, year: invoiceYear, dueDate: new Date(invoiceYear, invoiceMonth, dueDay) })
          .returning()
        inv = newInv
      }

      await tx.insert(installments).values({
        purchaseMemberId: pmId,
        debtId: pmId,
        memberId,
        invoiceId: inv.id,
        number: anticipateFromInstallment,
        amount: anticipatedAmount,
      })

      await tx.update(purchaseMembers)
        .set({ anticipatedAt: new Date(), anticipateFromInstallment })
        .where(eq(purchaseMembers.id, pmId))
    })
  }
}
