import { and, eq, sql } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db'
import { cards, installments, invoices } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'
import { resolveTargetPeriod } from '@/utils/resolve-target-period'

export const getTotalAmountUsedCard: FastifyPluginAsyncZod = async app => {
  app.get(
    '/api/cards/:cardId/total-amount-used',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Obter saldo total usado (parcelas futuras)',
        description:
          'Calcula a soma de todas as parcelas pendentes de um cartão, incluindo a fatura atual e todas as faturas futuras já registradas.',
        tags: ['Cards'],
        params: z.object({ cardId: z.string() }),
        response: {
          200: z.object({ totalAmountCard: z.number() }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user
      const { cardId } = request.params

      const [card] = await db
        .select({ dueDay: cards.dueDay })
        .from(cards)
        .where(and(eq(cards.id, cardId), eq(cards.ownerUserId, userId)))

      if (!card) return reply.status(404).send({ message: 'Cartão não encontrado' })

      // ✅ Usa o utilitário centralizado (sem month/year explícitos = calcula pelo dueDay)
      const { targetMonth, targetYear } = resolveTargetPeriod(card.dueDay)

      const [result] = await db
        .select({
          total: sql<number>`COALESCE(SUM(${installments.amount}), 0)`.mapWith(Number),
        })
        .from(installments)
        .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
        .where(
          and(
            eq(invoices.cardId, cardId),
            sql`(${invoices.year} > ${targetYear} OR (${invoices.year} = ${targetYear} AND ${invoices.month} >= ${targetMonth}))`,
          ),
        )

      return reply.send({ totalAmountCard: result?.total ?? 0 })
    },
  )
}
