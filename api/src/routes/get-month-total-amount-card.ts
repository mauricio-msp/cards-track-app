import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db'
import { cards, debts } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'
import { generateInstallmentCompetences } from '@/utils/generate-installment-competences'

export const getMonthTotalAmountCard: FastifyPluginAsyncZod = async app => {
  app.get(
    '/api/cards/:cardId/month-total-amount',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Get total invoice amount for a specific month',
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

      if (!card) return reply.status(404).send({ message: 'Card not found' })

      const rows = await db
        .select({
          invoiceMonth: debts.invoiceMonth,
          invoiceYear: debts.invoiceYear,
          startInstallment: debts.startInstallment,
          endInstallment: debts.endInstallment,
          installmentsCount: debts.installmentsCount,
          installmentsAmount: debts.installmentsAmount,
        })
        .from(debts)
        .where(eq(debts.cardId, cardId))

      const now = new Date()
      let targetMonth = month ?? (now.getDate() > card.dueDay ? now.getMonth() + 1 : now.getMonth())
      let targetYear = year ?? now.getFullYear()

      if (month === undefined && targetMonth > 11) {
        targetMonth = 0
        targetYear++
      }

      const totalAmountMonth = rows.reduce((acc, debt) => {
        const competences = generateInstallmentCompetences(
          debt.invoiceMonth,
          debt.invoiceYear,
          debt.installmentsCount,
        )

        // Encontra o índice da parcela para o mês/ano alvo
        const parcelIdx = competences.findIndex(
          c => c.month === targetMonth && c.year === targetYear,
        )

        if (parcelIdx === -1) return acc

        const currentParcelNum = parcelIdx + 1

        // --- LÓGICA DE INTERVALO ---
        const start = debt.startInstallment ?? 1
        const end = debt.endInstallment ?? debt.installmentsCount

        // Só somamos o valor se a parcela atual estiver dentro do intervalo de responsabilidade
        const isResponsible = currentParcelNum >= start && currentParcelNum <= end

        return isResponsible ? acc + Number(debt.installmentsAmount) : acc
      }, 0)

      return reply.send({ totalAmountMonth, targetMonth, targetYear })
    },
  )
}
