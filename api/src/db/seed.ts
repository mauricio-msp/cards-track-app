import { eq } from 'drizzle-orm'
import { uuidv7 } from 'uuidv7'

import { db } from '@/db'
import { cards, debts, members, users } from '@/db/schema'
import { calculateInvoiceCompetence } from '@/utils/calculate-invoice-competence'

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10)
}

/**
 * SEED FIXADO PARA USUÁRIO EXISTENTE
 */
const USER_ID = 'wQ7x9IbwJyDkL3sdtCanrR1vonogQKL9'

// ============================================
// LIMPEZA SEGURA
// ============================================
async function cleanDatabase() {
  await db.delete(debts)
  await db.delete(members)
  await db.delete(cards)
}

async function seed() {
  try {
    console.log('🌱 Iniciando seed...\n')

    const [user] = await db.select().from(users).where(eq(users.id, USER_ID)).limit(1)

    if (!user) throw new Error('Usuário não encontrado')

    await cleanDatabase()

    // ============================================
    // CARTÃO NUBANK (CENTAVOS)
    // ============================================
    const nubankCardId = uuidv7()
    const closingOffsetDays = 7
    const dueDay = 2
    const cardLimitCents = 24_000_00 // R$ 24.000,00

    await db.insert(cards).values({
      id: nubankCardId,
      ownerUserId: USER_ID,
      name: 'Nubank Mastercard',
      limit: cardLimitCents,
      closingOffsetDays,
      dueDay,
      createdAt: new Date(),
    })

    // ============================================
    // MEMBROS
    // ============================================
    const memberIds: Record<string, string> = {}

    const memberData = [
      { name: 'Maurício Porfírio', relationship: 'Titular' },
      { name: 'Maria Silva', relationship: 'Esposa' },
      { name: 'Pedro Silva', relationship: 'Filho' },
      { name: 'Ana Silva', relationship: 'Filha' },
      { name: 'Carlos Oliveira', relationship: 'Amigo' },
      { name: 'Beatriz Santos', relationship: 'Amiga' },
    ]

    for (const member of memberData) {
      const id = uuidv7()
      memberIds[member.name] = id

      await db.insert(members).values({
        id,
        userId: USER_ID,
        name: member.name,
        relationship: member.relationship,
        createdAt: new Date(),
      })
    }

    // ============================================
    // FUNÇÃO AUXILIAR
    // ============================================
    async function insertDebt({
      memberName,
      description,
      tags,
      amount,
      installmentsCount,
      installmentsAmount,
      startedAt,
      groupId = uuidv7(),
      cardId,
    }: {
      memberName: string
      description: string
      tags: string[]
      amount: number
      installmentsCount: number
      installmentsAmount: number
      startedAt: Date
      groupId?: string
      cardId: string
    }) {
      const { invoiceMonth, invoiceYear } = calculateInvoiceCompetence(startedAt, closingOffsetDays)

      await db.insert(debts).values({
        id: uuidv7(),
        groupId,
        cardId,
        memberId: memberIds[memberName],
        description,
        tags,
        amount,
        installmentsCount,
        installmentsAmount,
        purchaseDate: toDateString(startedAt),
        invoiceMonth,
        invoiceYear,
        createdAt: new Date(),
      })
    }

    // ============================================
    // DÍVIDAS
    // ============================================

    // 1️⃣ Supermercado — R$100,00 (1x)
    await insertDebt({
      memberName: 'Maurício Porfírio',
      description: 'Compra no supermercado',
      tags: ['supermercado'],
      amount: 10_000,
      installmentsCount: 1,
      installmentsAmount: 10_000,
      startedAt: new Date(2025, 10, 1),
      cardId: nubankCardId,
    })

    // 2️⃣ Jantar dividido — R$90,00 → 3 pessoas (R$30 cada)
    const dinnerGroup = uuidv7()
    for (const name of ['Maurício Porfírio', 'Maria Silva', 'Pedro Silva']) {
      await insertDebt({
        memberName: name,
        description: 'Jantar em grupo',
        tags: ['restaurante'],
        amount: 3_000,
        installmentsCount: 1,
        installmentsAmount: 3_000,
        startedAt: new Date(2025, 11, 5),
        groupId: dinnerGroup,
        cardId: nubankCardId,
      })
    }

    // 3️⃣ Viagem — R$90,00 em 3x (R$30/mês)
    await insertDebt({
      memberName: 'Pedro Silva',
      description: 'Hospedagem em viagem',
      tags: ['viagem'],
      amount: 9_000,
      installmentsCount: 3,
      installmentsAmount: 3_000,
      startedAt: new Date(2026, 0, 15),
      cardId: nubankCardId,
    })

    // 4️⃣ Compras online — R$80,00 em 2x (R$40/mês)
    await insertDebt({
      memberName: 'Ana Silva',
      description: 'Compras online',
      tags: ['compras'],
      amount: 8_000,
      installmentsCount: 2,
      installmentsAmount: 4_000,
      startedAt: new Date(2026, 0, 20),
      cardId: nubankCardId,
    })

    // 5️⃣ Churrascaria — R$80,00 → divisão desigual
    const bbqGroup = uuidv7()

    await insertDebt({
      memberName: 'Carlos Oliveira',
      description: 'Churrascaria',
      tags: ['restaurante'],
      amount: 4_000,
      installmentsCount: 1,
      installmentsAmount: 4_000,
      startedAt: new Date(2026, 0, 25),
      groupId: bbqGroup,
      cardId: nubankCardId,
    })

    await insertDebt({
      memberName: 'Beatriz Santos',
      description: 'Churrascaria',
      tags: ['restaurante'],
      amount: 2_000,
      installmentsCount: 1,
      installmentsAmount: 2_000,
      startedAt: new Date(2026, 0, 25),
      groupId: bbqGroup,
      cardId: nubankCardId,
    })

    // 6️⃣ Reforma — R$100,00 em 2x (R$50/mês)
    await insertDebt({
      memberName: 'Maria Silva',
      description: 'Reforma do apartamento',
      tags: ['reforma'],
      amount: 10_000,
      installmentsCount: 2,
      installmentsAmount: 5_000,
      startedAt: new Date(2025, 11, 10),
      cardId: nubankCardId,
    })

    // ============================================
    // CARTÃO NEON (CENTAVOS)
    // ============================================
    const neonCardId = uuidv7()
    const neonCardLimitCents = 3_800_00 // R$ 3.800,00

    await db.insert(cards).values({
      id: neonCardId,
      ownerUserId: USER_ID,
      name: 'Neon',
      limit: neonCardLimitCents,
      closingOffsetDays: 5,
      dueDay: 5,
      createdAt: new Date(),
    })

    // Dívidas Neon
    // 7️⃣ Gasolina — R$150,00 (1x)
    await insertDebt({
      memberName: 'Maurício Porfírio',
      description: 'Abastecimento gasolina',
      tags: ['combustível'],
      amount: 15_000,
      installmentsCount: 1,
      installmentsAmount: 15_000,
      startedAt: new Date(2026, 0, 10),
      cardId: neonCardId,
    })

    // 8️⃣ Farmácia — R$85,00 → divisão entre 2
    const pharmacyGroup = uuidv7()
    for (const name of ['Maria Silva', 'Pedro Silva']) {
      await insertDebt({
        memberName: name,
        description: 'Medicamentos farmácia',
        tags: ['saúde'],
        amount: 4_250,
        installmentsCount: 1,
        installmentsAmount: 4_250,
        startedAt: new Date(2026, 0, 22),
        groupId: pharmacyGroup,
        cardId: neonCardId,
      })
    }

    // ============================================
    // CARTÃO PICPAY
    // ============================================
    const picpayCardId = uuidv7()
    const picpayCardLimitCents = 12_300_00 // R$ 12.300,00

    await db.insert(cards).values({
      id: picpayCardId,
      ownerUserId: USER_ID,
      name: 'PicPay',
      limit: picpayCardLimitCents,
      closingOffsetDays: 5,
      dueDay: 15,
      createdAt: new Date(),
    })

    // Dívidas PicPay
    // 9️⃣ Academia — R$120,00 em 4x (R$30/mês)
    await insertDebt({
      memberName: 'Ana Silva',
      description: 'Mensalidade academia',
      tags: ['saúde'],
      amount: 12_000,
      installmentsCount: 4,
      installmentsAmount: 3_000,
      startedAt: new Date(2025, 10, 15),
      cardId: picpayCardId,
    })

    // 🔟 Cinema — R$70,00 → 2 pessoas
    const cinemaGroup = uuidv7()
    for (const name of ['Carlos Oliveira', 'Beatriz Santos']) {
      await insertDebt({
        memberName: name,
        description: 'Sessão cinema',
        tags: ['lazer'],
        amount: 3_500,
        installmentsCount: 1,
        installmentsAmount: 3_500,
        startedAt: new Date(2026, 0, 18),
        groupId: cinemaGroup,
        cardId: picpayCardId,
      })
    }

    // 1️⃣1️⃣ Streaming anual — R$180,00 em 6x (R$30/mês)
    await insertDebt({
      memberName: 'Pedro Silva',
      description: 'Assinatura plataforma streaming',
      tags: ['streaming'],
      amount: 18_000,
      installmentsCount: 6,
      installmentsAmount: 3_000,
      startedAt: new Date(2025, 11, 1),
      cardId: picpayCardId,
    })

    console.log('✨ Seed concluído com sucesso!')
  } catch (error) {
    console.error('❌ Erro no seed:', error)
    process.exit(1)
  }
}

seed().then(() => process.exit(0))
