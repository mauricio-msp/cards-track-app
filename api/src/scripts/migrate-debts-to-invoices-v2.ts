import { and, eq, isNull } from 'drizzle-orm'
import { uuidv7 } from 'uuidv7'
import { db } from '@/db'
import { cards, debts, installments, invoices } from '@/db/schema'

async function run() {
  console.log('🚀 Iniciando carga corretiva para os registros pendentes...')

  // 1. Busca apenas os débitos que ainda estão com invoice_id nulo
  const pendingDebts = await db.select().from(debts).where(isNull(debts.invoiceId))
  const allCards = await db.select().from(cards)

  console.log(`📊 Total de débitos pendentes encontrados: ${pendingDebts.length}`)

  if (pendingDebts.length === 0) {
    console.log('✅ Nenhum débito pendente encontrado. Tudo em ordem!')
    return
  }

  for (const debt of pendingDebts) {
    // Busca o cartão garantindo que a comparação de IDs seja entre strings
    const card = allCards.find(c => String(c.id) === String(debt.cardId))

    if (!card) {
      console.error(
        `❌ Erro: Cartão ID [${debt.cardId}] não encontrado para o débito [${debt.description}]`,
      )
      continue
    }

    try {
      // 2. Criar ou buscar a Invoice da PRIMEIRA parcela (onde o débito "nasce")
      let [firstInvoice] = await db
        .select()
        .from(invoices)
        .where(
          and(
            eq(invoices.cardId, card.id),
            eq(invoices.month, debt.invoiceMonth),
            eq(invoices.year, debt.invoiceYear),
          ),
        )

      if (!firstInvoice) {
        // Criamos a data de vencimento baseada no dia configurado no cartão
        const dueDate = new Date(debt.invoiceYear, debt.invoiceMonth, card.dueDay)
        const [newInv] = await db
          .insert(invoices)
          .values({
            id: uuidv7(),
            cardId: card.id,
            month: debt.invoiceMonth,
            year: debt.invoiceYear,
            dueDate,
          })
          .returning()
        firstInvoice = newInv
        console.log(`🆕 Nova fatura criada: ${debt.invoiceMonth + 1}/${debt.invoiceYear}`)
      }

      // 3. VINCULAR o débito original à fatura inicial (Passo essencial)
      await db.update(debts).set({ invoiceId: firstInvoice.id }).where(eq(debts.id, debt.id))

      // 4. Gerar todas as N parcelas na tabela installments
      for (let i = 0; i < debt.installmentsCount; i++) {
        let m = debt.invoiceMonth + i
        let y = debt.invoiceYear

        // Ajusta mês/ano (Ex: 12/2025 vira 00/2026)
        while (m > 11) {
          m -= 12
          y++
        }

        // Busca ou cria a fatura para cada parcela subsequente
        let [currentInvoice] = await db
          .select()
          .from(invoices)
          .where(and(eq(invoices.cardId, card.id), eq(invoices.month, m), eq(invoices.year, y)))

        if (!currentInvoice) {
          const dDate = new Date(y, m, card.dueDay)
          const [nInv] = await db
            .insert(invoices)
            .values({
              id: uuidv7(),
              cardId: card.id,
              month: m,
              year: y,
              dueDate: dDate,
            })
            .returning()
          currentInvoice = nInv
        }

        // Insere a parcela vinculada ao débito e à fatura do mês correspondente
        await db.insert(installments).values({
          id: uuidv7(),
          debtId: debt.id,
          invoiceId: currentInvoice.id,
          memberId: debt.memberId,
          number: i + 1,
          amount: debt.installmentsAmount,
        })
      }

      console.log(
        `✅ Sucesso: "${debt.description}" processado com ${debt.installmentsCount} parcelas.`,
      )
    } catch (err) {
      console.error(`💥 Falha crítica ao processar "${debt.description}":`, err)
    }
  }

  console.log('\n🏁 Processo de migração concluído!')
}

run().catch(err => {
  console.error('❌ Erro fatal na execução do script:', err)
  process.exit(1)
})
