import { and, eq, sql } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db'
import { cards, debts, installments, invoices, members } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'

export const getTotalDebtsAmount: FastifyPluginAsyncZod = async app => {
  app.get(
    '/api/total-debts-amount',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Obter saldo devedor total de todos os cartões',
        description:
          'Calcula o montante total de todas as parcelas pendentes em todos os cartões do usuário, respeitando o intervalo de responsabilidade de cada membro.',
        tags: ['Debts'],
        response: {
          200: z.object({
            totalAmount: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user

      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth()
      const today = now.getDate()

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
        .innerJoin(debts, eq(installments.debtId, debts.id)) // ✅
        .innerJoin(cards, and(eq(invoices.cardId, cards.id), eq(cards.ownerUserId, userId)))
        .innerJoin(members, and(eq(installments.memberId, members.id), eq(members.userId, userId)))
        .where(
          sql`
            (${invoices.year} > ${currentYear}) OR
            (${invoices.year} = ${currentYear} AND ${invoices.month} > ${currentMonth}) OR
            (${invoices.year} = ${currentYear} AND ${invoices.month} = ${currentMonth} AND ${cards.dueDay} >= ${today})
          `,
        )

      return reply.status(200).send({
        totalAmount: result?.total ?? 0,
      })
    },
  )
}
