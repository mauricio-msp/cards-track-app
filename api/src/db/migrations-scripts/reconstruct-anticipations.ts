import { and, eq, isNotNull } from 'drizzle-orm'
import type { db as Db } from '@/db'
import { cards, installments, invoices, purchaseMembers, purchases } from '@/db/schema'
import { calculateInvoiceCompetence } from '@/utils/calculate-invoice-competence'

type PlanInput = {
  installmentAmount: number
  anticipateFromInstallment: number
  lumpAmount: number
  lumpInvoiceId: string
  baseMonth: number // 0-11
  baseYear: number
}

export type ReconstructedRow = {
  number: number
  amount: number
  invoiceId: string
  naturalMonth: number
  naturalYear: number
}

export function planReconstruction(input: PlanInput): {
  count: number
  rows: ReconstructedRow[]
} {
  const { installmentAmount, anticipateFromInstallment, lumpAmount, lumpInvoiceId, baseMonth, baseYear } =
    input
  const count = Math.round(lumpAmount / installmentAmount)
  const rows: ReconstructedRow[] = []
  for (let i = 0; i < count; i++) {
    const number = anticipateFromInstallment + i
    // natural period = base + (number - 1) months
    const offset = number - 1
    const d = new Date(baseYear, baseMonth + offset, 1)
    rows.push({
      number,
      amount: installmentAmount,
      invoiceId: lumpInvoiceId,
      naturalMonth: d.getMonth(),
      naturalYear: d.getFullYear(),
    })
  }
  return { count, rows }
}

// Orchestrates the reconstruction over the real DB. Idempotent: a pm whose lump
// row no longer exists (already reconstructed) is skipped.
export async function reconstructAnticipations(
  db: typeof Db,
): Promise<{ pmsProcessed: number; rowsCreated: number }> {
  let pmsProcessed = 0
  let rowsCreated = 0

  const legacyPms = await db
    .select({
      id: purchaseMembers.id,
      memberId: purchaseMembers.memberId,
      installmentAmount: purchaseMembers.installmentAmount,
      anticipateFromInstallment: purchaseMembers.anticipateFromInstallment,
      purchaseId: purchaseMembers.purchaseId,
    })
    .from(purchaseMembers)
    .where(and(isNotNull(purchaseMembers.anticipatedAt), isNotNull(purchaseMembers.anticipateFromInstallment)))

  for (const pm of legacyPms) {
    const F = pm.anticipateFromInstallment as number

    // The lump row: this pm's installment at number = F.
    const [lump] = await db
      .select({
        id: installments.id,
        amount: installments.amount,
        invoiceId: installments.invoiceId,
        anticipatedAt: installments.anticipatedAt,
      })
      .from(installments)
      .where(and(eq(installments.purchaseMemberId, pm.id), eq(installments.number, F)))

    // Idempotency: already reconstructed (row already flagged) -> skip.
    if (!lump || lump.anticipatedAt) continue

    // base period = the purchase's natural first competence, recomputed from
    // purchaseDate + card config the same way create-purchase originally did.
    // (NOT installments.number = 1 -- when F === 1, that row IS the relocated
    // lump and no longer sits in its natural period.)
    const [purchaseCard] = await db
      .select({
        cardId: purchases.cardId,
        purchaseDate: purchases.purchaseDate,
        dueDay: cards.dueDay,
        closingOffsetDays: cards.closingOffsetDays,
      })
      .from(purchases)
      .innerJoin(cards, eq(purchases.cardId, cards.id))
      .where(eq(purchases.id, pm.purchaseId))

    if (!purchaseCard) continue

    const [datePart] = purchaseCard.purchaseDate.split('T')
    const purchaseDateResetHours = new Date(`${datePart}T00:00:00`)
    const { invoiceMonth: baseMonth, invoiceYear: baseYear } = calculateInvoiceCompetence(
      purchaseDateResetHours,
      purchaseCard.dueDay,
      purchaseCard.closingOffsetDays,
    )
    const cardId = purchaseCard.cardId

    const plan = planReconstruction({
      installmentAmount: pm.installmentAmount,
      anticipateFromInstallment: F,
      lumpAmount: lump.amount,
      lumpInvoiceId: lump.invoiceId,
      baseMonth,
      baseYear,
    })

    await db.transaction(async tx => {
      // delete the lump
      await tx.delete(installments).where(eq(installments.id, lump.id))

      for (const row of plan.rows) {
        // ensure the natural invoice exists (for original_invoice_id)
        let [natInv] = await tx
          .select({ id: invoices.id })
          .from(invoices)
          .where(
            and(
              eq(invoices.cardId, cardId),
              eq(invoices.month, row.naturalMonth),
              eq(invoices.year, row.naturalYear),
            ),
          )
        if (!natInv) {
          const [created] = await tx
            .insert(invoices)
            .values({
              cardId,
              month: row.naturalMonth,
              year: row.naturalYear,
              dueDate: new Date(row.naturalYear, row.naturalMonth, 1),
            })
            .returning({ id: invoices.id })
          natInv = created
        }

        await tx.insert(installments).values({
          purchaseMemberId: pm.id,
          memberId: pm.memberId,
          invoiceId: row.invoiceId, // sits in the anticipation invoice
          number: row.number,
          amount: row.amount,
          anticipatedAt: new Date(),
          originalInvoiceId: natInv.id,
        })
        rowsCreated++
      }
    })
    pmsProcessed++
  }

  return { pmsProcessed, rowsCreated }
}
