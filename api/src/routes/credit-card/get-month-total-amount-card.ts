import { and, eq, sql } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db'
import { cards, debts, installments, invoices } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'
import { resolveTargetPeriod } from '@/utils/resolve-target-period'

export const getMonthTotalAmountCard: FastifyPluginAsyncZod = async app => {
  app.get(
    '/api/cards/:cardId/month-total-amount',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Obter valor total da fatura para um mês específico',
        description:
          'Calcula a soma de todas as parcelas vinculadas à fatura de um cartão, respeitando o intervalo de responsabilidade de cada membro.',
        tags: ['Cards'],
        params: z.object({ cardId: z.string() }),
        querystring: z.object({
          month: z.coerce.number().int().min(0).max(11).optional(),
          year: z.coerce.number().int().optional(),
        }),
        response: {
          200: z.object({
            totalAmountMonth: z.number(),
            targetMonth: z.number(),
            targetYear: z.number(),
          }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user
      const { cardId } = request.params
      const { month, year } = request.query

      const [card] = await db
        .select({ dueDay: cards.dueDay })
        .from(cards)
        .where(and(eq(cards.id, cardId), eq(cards.ownerUserId, userId)))

      if (!card) return reply.status(404).send({ message: 'Cartão não encontrado' })

      const { targetMonth, targetYear } = resolveTargetPeriod(card.dueDay, month, year)

      const [result] = await db
        .select({
          total: sql<number>`
            COALESCE(
              SUM(
                CASE
                  WHEN ${installments.number} >= ${debts.startInstallment}
                    AND ${installments.number} <= COALESCE(${debts.endInstallment}, ${debts.installmentsCount})
                  THEN ${installments.amount}
                  ELSE 0
                END
              ),
              0
            )
          `.mapWith(Number),
        })
        .from(installments)
        .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
        .innerJoin(debts, eq(installments.debtId, debts.id)) // ✅ JOIN com debts para acessar o intervalo
        .where(
          and(
            eq(invoices.cardId, cardId),
            eq(invoices.month, targetMonth),
            eq(invoices.year, targetYear),
          ),
        )

      return reply.send({
        totalAmountMonth: result?.total ?? 0,
        targetMonth,
        targetYear,
      })
    },
  )
}
