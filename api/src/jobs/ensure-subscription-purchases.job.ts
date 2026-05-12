import { and, eq, inArray } from 'drizzle-orm'
import { uuidv7 } from 'uuidv7'
import type { db as Db } from '@/db'
import { cards, installments, invoices, purchaseMembers, purchases, subscriptions } from '@/db/schema'
import { calculateInvoiceCompetence } from '@/utils/calculate-invoice-competence'

type ActiveSubscription = {
  id: string
  cardId: string
  memberId: string
  name: string
  amount: number
  billingDay: number
  card: { dueDay: number; closingOffsetDays: number }
}

type SubscriptionWithMonth = {
  sub: ActiveSubscription
  invoiceMonth: number
  invoiceYear: number
  purchaseDateStr: string
}

export async function ensureSubscriptionPurchases(db: typeof Db): Promise<void> {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // 1. Load all active subscriptions with card info in one query
  const activeSubs = await db
    .select({
      id: subscriptions.id,
      cardId: subscriptions.cardId,
      memberId: subscriptions.memberId,
      name: subscriptions.name,
      amount: subscriptions.amount,
      billingDay: subscriptions.billingDay,
      card: { dueDay: cards.dueDay, closingOffsetDays: cards.closingOffsetDays },
    })
    .from(subscriptions)
    .innerJoin(cards, eq(subscriptions.cardId, cards.id))
    .where(eq(subscriptions.active, true))

  if (activeSubs.length === 0) return

  // 2. Calculate billing month for each subscription, keep only current month
  const subsForCurrentMonth: SubscriptionWithMonth[] = []

  for (const sub of activeSubs) {
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const day = Math.min(sub.billingDay, lastDayOfMonth)
    const purchaseDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const purchaseDate = new Date(`${purchaseDateStr}T00:00:00`)

    const { invoiceMonth, invoiceYear } = calculateInvoiceCompetence(
      purchaseDate,
      sub.card.dueDay,
      sub.card.closingOffsetDays,
    )

    if (invoiceMonth === currentMonth && invoiceYear === currentYear) {
      subsForCurrentMonth.push({ sub, invoiceMonth, invoiceYear, purchaseDateStr })
    }
  }

  if (subsForCurrentMonth.length === 0) return

  // 3. Batch check which subscriptions already have purchases for this month
  const subIds = subsForCurrentMonth.map(s => s.sub.id)

  const existingPurchases = await db
    .select({ subscriptionId: purchases.subscriptionId })
    .from(purchases)
    .innerJoin(
      invoices,
      and(
        eq(purchases.invoiceId, invoices.id),
        eq(invoices.month, currentMonth),
        eq(invoices.year, currentYear),
      ),
    )
    .where(inArray(purchases.subscriptionId, subIds))

  const existingSubIds = new Set(existingPurchases.map(r => r.subscriptionId))

  // 4. Create only for subscriptions that are missing a purchase
  const subsToCreate = subsForCurrentMonth.filter(s => !existingSubIds.has(s.sub.id))

  for (const { sub, invoiceMonth, invoiceYear, purchaseDateStr } of subsToCreate) {
    let [invoice] = await db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.cardId, sub.cardId),
          eq(invoices.month, invoiceMonth),
          eq(invoices.year, invoiceYear),
        ),
      )

    if (!invoice) {
      const dueDate = new Date(invoiceYear, invoiceMonth, sub.card.dueDay)
      const [newInv] = await db
        .insert(invoices)
        .values({ cardId: sub.cardId, month: invoiceMonth, year: invoiceYear, dueDate })
        .returning()
      invoice = newInv
    }

    const purchaseId = uuidv7()
    const [newPurchase] = await db
      .insert(purchases)
      .values({
        id: purchaseId,
        cardId: sub.cardId,
        invoiceId: invoice.id,
        subscriptionId: sub.id,
        description: sub.name,
        category: 'Assinatura',
        purchaseDate: purchaseDateStr,
        installmentsCount: 1,
      })
      .returning()

    const [pm] = await db
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

    await db.insert(installments).values({
      purchaseMemberId: pm.id,
      invoiceId: invoice.id,
      memberId: sub.memberId,
      number: 1,
      amount: sub.amount,
    })
  }
}
