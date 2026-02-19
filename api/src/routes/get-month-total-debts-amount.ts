import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db'
import { cards, debts } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'

export const getMonthTotalDebtsAmount: FastifyPluginAsyncZod = async app => {
  app.get(
    '/api/month-total-debts-amount',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Soma das faturas pendentes de pagamento no mês atual.',
        tags: ['Debts'],
        response: {
          200: z.object({ totalAmount: z.number() }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user

      const rows = await db
        .select({
          card: { dueDay: cards.dueDay },
          debt: {
            invoiceYear: debts.invoiceYear,
            invoiceMonth: debts.invoiceMonth,
            installmentsCount: debts.installmentsCount,
            installmentsAmount: debts.installmentsAmount,
          },
        })
        .from(debts)
        .innerJoin(cards, eq(debts.cardId, cards.id))
        .where(eq(cards.ownerUserId, userId))

      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      const today = now.getDate()

      const totalAmount = rows.reduce((sum, { card, debt }) => {
        // 1. REGRA DE CORTE: Se o dia de hoje já passou do dia de vencimento do cartão,
        // ignoramos esse cartão pois a fatura já "venceu" (foi paga).
        if (today > card.dueDay) {
          return sum
        }

        // 2. Verificar se este débito tem uma parcela caindo exatamente no mês atual
        // Calculamos a distância em meses entre o início da dívida e hoje
        const monthDiff = (currentYear - debt.invoiceYear) * 12 + (currentMonth - debt.invoiceMonth)

        // Se monthDiff for 0, é a primeira parcela. Se for 1, é a segunda, etc.
        // A parcela é válida se estiver dentro do intervalo [0, installmentsCount - 1]
        const isInstallmentActiveInCurrentMonth =
          monthDiff >= 0 && monthDiff < debt.installmentsCount

        if (isInstallmentActiveInCurrentMonth) {
          return sum + debt.installmentsAmount
        }

        return sum
      }, 0)

      return reply.status(200).send({ totalAmount })
    },
  )
}
