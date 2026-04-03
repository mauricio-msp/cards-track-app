import { and, eq, sql } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db'
import { cards, installments, invoices } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'

export const getMonthLowestDebtsAmount: FastifyPluginAsyncZod = async app => {
  app.get(
    '/api/month-lowest-debts-amount',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Obter cartões com menor valor de fatura no mês atual',
        description:
          'Analisa as faturas de todos os cartões do usuário para o mês e ano vigentes, retornando o valor da menor fatura encontrada entre os cartões que possuem gastos e quais cartões possuem esse montante.',
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

      // 1. Buscamos os totais agrupados por cartão diretamente via SQL para o mês atual
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

      // 2. Encontrar o valor mínimo entre os cartões que possuem movimentação
      const lowestAmount = cardTotals.length ? Math.min(...cardTotals.map(c => c.total)) : 0

      // 3. Filtrar os cartões que possuem exatamente o valor mínimo
      const cardsWithLowestDebt = cardTotals.filter(c => c.total === lowestAmount)

      return reply.status(200).send({
        amount: lowestAmount,
        cards: lowestAmount > 0 ? cardsWithLowestDebt : [],
      })
    },
  )
}
