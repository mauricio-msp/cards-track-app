import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db'
import { cards, debts } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'

export const getMonthHighestDebtsAmount: FastifyPluginAsyncZod = async app => {
  app.get(
    '/api/month-highest-debts-amount',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Retorna o(s) cartão(ões) com a maior fatura dentro do mês atual.',
        tags: ['Debts'],
        response: {
          200: z.object({
            amount: z.number(),
            cards: z.array(
              z.object({
                cardId: z.string(),
                cardName: z.string(),
                total: z.number(),
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user

      const rows = await db
        .select({
          card: { id: cards.id, name: cards.name },
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

      // 1. Agrupar totais por cartão para o mês calendário atual
      const totalsByCardMap = rows.reduce(
        (acc, { debt, card }) => {
          // Cálculo de diferença de meses para saber se a parcela cai HOJE
          const monthDiff =
            (currentYear - debt.invoiceYear) * 12 + (currentMonth - debt.invoiceMonth)

          // Se a diferença está entre 0 e o total de parcelas, ela pertence ao mês atual
          const isActiveThisMonth = monthDiff >= 0 && monthDiff < debt.installmentsCount

          if (isActiveThisMonth) {
            if (!acc[card.id]) {
              acc[card.id] = {
                cardId: card.id,
                cardName: card.name,
                total: 0,
              }
            }
            acc[card.id].total += debt.installmentsAmount
          }

          return acc
        },
        {} as Record<string, { cardId: string; cardName: string; total: number }>,
      )

      const totalsByCard = Object.values(totalsByCardMap)

      // 2. Encontrar o valor máximo
      const highestAmount = totalsByCard.length ? Math.max(...totalsByCard.map(c => c.total)) : 0

      // 3. Filtrar todos os cartões que possuem esse valor máximo (caso haja empate)
      const cardsWithHighestDebt = totalsByCard.filter(c => c.total === highestAmount)

      return reply.status(200).send({
        amount: highestAmount,
        cards: highestAmount > 0 ? cardsWithHighestDebt : [],
      })
    },
  )
}
