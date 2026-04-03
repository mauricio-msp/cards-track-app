import { and, eq, sql } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db'
import { cards, installments, invoices } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'

export const getMonthHighestDebtsAmount: FastifyPluginAsyncZod = async app => {
  app.get(
    '/api/month-highest-debts-amount',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Obter cartões com maior valor de fatura no mês atual',
        description:
          'Analisa as faturas de todos os cartões do usuário para o mês e ano vigentes, retornando o valor da maior fatura encontrada e quais cartões possuem esse montante.',
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

      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()

      // 1. Buscamos os totais agrupados por cartão diretamente via SQL
      // Filtramos pela invoice do mês/ano atual
      const cardTotals = await db
        .select({
          cardId: cards.id,
          cardName: cards.name,
          total: sql<number>`sum(${installments.amount})`.mapWith(Number),
        })
        .from(installments)
        .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
        .innerJoin(cards, eq(invoices.cardId, cards.id))
        .where(
          and(
            eq(cards.ownerUserId, userId),
            eq(invoices.month, currentMonth),
            eq(invoices.year, currentYear),
          ),
        )
        .groupBy(cards.id, cards.name)

      // 2. Encontrar o valor máximo entre os totais calculados
      const highestAmount = cardTotals.length ? Math.max(...cardTotals.map(c => c.total)) : 0

      // 3. Filtrar os cartões que atingiram esse valor máximo (para casos de empate)
      const cardsWithHighestDebt = cardTotals.filter(c => c.total === highestAmount)

      return reply.status(200).send({
        amount: highestAmount,
        cards: highestAmount > 0 ? cardsWithHighestDebt : [],
      })
    },
  )
}
