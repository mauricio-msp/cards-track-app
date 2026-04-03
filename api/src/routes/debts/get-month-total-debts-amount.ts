import { and, eq, gt, sql } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db'
import { cards, debts, installments, invoices } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'

export const getMonthTotalDebtsAmount: FastifyPluginAsyncZod = async app => {
  app.get(
    '/api/month-total-debts-amount',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Obter soma total das faturas pendentes no mês atual',
        description:
          'Calcula o valor total de todas as faturas do mês vigente que ainda não venceram, respeitando o intervalo de responsabilidade de cada membro.',
        tags: ['Debts'],
        response: {
          200: z.object({ totalAmount: z.number() }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user

      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      const today = now.getDate()

      const result = await db
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
        .innerJoin(debts, eq(installments.debtId, debts.id)) // ✅
        .innerJoin(cards, eq(invoices.cardId, cards.id))
        .where(
          and(
            eq(cards.ownerUserId, userId),
            eq(invoices.month, currentMonth),
            eq(invoices.year, currentYear),
            gt(cards.dueDay, today),
          ),
        )

      return reply.status(200).send({ totalAmount: result[0]?.total ?? 0 })
    },
  )
}
