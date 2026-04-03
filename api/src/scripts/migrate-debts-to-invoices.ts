import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { cards, debts, installments, invoices } from '@/db/schema'

async function runMigration() {
  console.log('🔄 Iniciando materialização de parcelas...')

  const allDebts = await db.select().from(debts)
  const allCards = await db.select().from(cards)

  for (const debt of allDebts) {
    const card = allCards.find(c => c.id === debt.cardId)

    if (!card) {
      console.log(`⚠️ Pulando "${debt.description}": Cartão ${debt.cardId} não encontrado.`)
      continue
    }

    for (let i = 0; i < debt.installmentsCount; i++) {
      // Cálculo do mês/ano da parcela
      let m = debt.invoiceMonth + i
      let y = debt.invoiceYear
      while (m > 11) {
        m -= 12
        y++
      }

      // 1. Busca ou cria a Invoice
      let [invoice] = await db
        .select()
        .from(invoices)
        .where(and(eq(invoices.cardId, debt.cardId), eq(invoices.month, m), eq(invoices.year, y)))

      if (!invoice) {
        const dueDate = new Date(y, m, card.dueDay)
        const [newInvoice] = await db
          .insert(invoices)
          .values({
            cardId: debt.cardId,
            month: m,
            year: y,
            dueDate: dueDate,
          })
          .returning()
        invoice = newInvoice
      }

      // 2. Cria a parcela física
      await db.insert(installments).values({
        debtId: debt.id,
        invoiceId: invoice.id,
        memberId: debt.memberId,
        number: i + 1,
        amount: debt.installmentsAmount,
      })
    }
    console.log(`✅ ${debt.description} processado.`)
  }
  console.log('🚀 Migração concluída!')
}

runMigration().catch(console.error)
