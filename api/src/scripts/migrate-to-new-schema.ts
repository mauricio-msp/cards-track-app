import { and, eq, isNull } from 'drizzle-orm'
import { uuidv7 } from 'uuidv7'
import { db } from '@/db'
import { debts, installments, purchaseMembers, purchases } from '@/db/schema'

async function main() {
  const allDebts = await db.select().from(debts)

  const groupIds = [...new Set(allDebts.map(d => d.groupId))]
  console.log(`Groups to migrate: ${groupIds.length}`)

  let purchasesCreated = 0
  let purchaseMembersCreated = 0
  let installmentsUpdated = 0

  for (const groupId of groupIds) {
    const group = allDebts.filter(d => d.groupId === groupId)
    const first = group[0]

    // Check if purchase already exists for this group (idempotent)
    const [existing] = await db
      .select({ id: purchases.id })
      .from(purchases)
      // purchases don't have groupId — use subscriptionId + invoiceId + description as proxy,
      // but simplest idempotency: store groupId mapping in a temp column or just check by
      // matching all fields. Since we control this script, track via a local map instead.
      .where(
        and(
          eq(purchases.cardId, first.cardId),
          eq(purchases.invoiceId, first.invoiceId),
          eq(purchases.description, first.description),
          eq(purchases.purchaseDate, first.purchaseDate),
        ),
      )
      .limit(1)

    const purchaseId = existing?.id ?? uuidv7()

    if (!existing) {
      await db.insert(purchases).values({
        id: purchaseId,
        cardId: first.cardId,
        invoiceId: first.invoiceId,
        subscriptionId: first.subscriptionId ?? null,
        description: first.description,
        category: first.category ?? null,
        purchaseDate: first.purchaseDate,
        installmentsCount: first.installmentsCount,
        createdAt: first.createdAt,
      })
      purchasesCreated++
    }

    for (const debt of group) {
      const [existingPm] = await db
        .select({ id: purchaseMembers.id })
        .from(purchaseMembers)
        .where(
          and(
            eq(purchaseMembers.purchaseId, purchaseId),
            eq(purchaseMembers.memberId, debt.memberId),
          ),
        )
        .limit(1)

      const pmId = existingPm?.id ?? uuidv7()

      if (!existingPm) {
        await db.insert(purchaseMembers).values({
          id: pmId,
          purchaseId,
          memberId: debt.memberId,
          amount: debt.amount,
          installmentAmount: debt.installmentsAmount,
          startInstallment: debt.startInstallment,
          endInstallment: debt.endInstallment ?? null,
          anticipatedAt: debt.anticipatedAt ?? null,
          anticipateFromInstallment: debt.anticipateFromInstallment ?? null,
          createdAt: debt.createdAt,
        })
        purchaseMembersCreated++
      }

      // Update installments that belong to this debt and don't have purchase_member_id yet
      const result = await db
        .update(installments)
        .set({ purchaseMemberId: pmId })
        .where(
          and(
            eq(installments.debtId, debt.id),
            isNull(installments.purchaseMemberId),
          ),
        )

      installmentsUpdated += (result as unknown as { rowCount: number }).rowCount ?? 0
    }
  }

  console.log(`Done.`)
  console.log(`  purchases created:        ${purchasesCreated}`)
  console.log(`  purchase_members created: ${purchaseMembersCreated}`)
  console.log(`  installments updated:     ${installmentsUpdated}`)

  // Verify — any installments still without purchase_member_id?
  const pending = await db
    .select({ id: installments.id })
    .from(installments)
    .where(isNull(installments.purchaseMemberId))

  if (pending.length > 0) {
    console.warn(`\nWARN: ${pending.length} installments still without purchase_member_id`)
  } else {
    console.log(`\nAll installments linked to purchase_members. Safe to make NOT NULL.`)
  }

  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
