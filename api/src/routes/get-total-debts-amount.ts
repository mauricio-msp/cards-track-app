import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db'
import { cards, debts } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'
import { generateInstallmentCompetences } from '@/utils/generate-installment-competences'

export const getTotalDebtsAmount: FastifyPluginAsyncZod = async app => {
  app.get(
    '/api/total-debts-amount',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Soma total de todas as parcelas futuras de todos os cartões.',
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
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth()
      const today = now.getDate()

      const totalAmount = rows.reduce((sum, { card, debt }) => {
        const competences = generateInstallmentCompetences(
          debt.invoiceMonth,
          debt.invoiceYear,
          debt.installmentsCount,
        )

        // Verificamos o que já passou.
        // Se hoje (dia 6) > vencimento (dia 5), a parcela deste mês já é considerada "passada".
        const isAfterDueDay = today > card.dueDay

        const pastInstallmentsCount = competences.filter(c => {
          if (c.year < currentYear) return true
          if (c.year === currentYear) {
            if (c.month < currentMonth) return true
            // Se for o mês atual e já passou o dia de pagar, conta como parcela paga/passada
            if (c.month === currentMonth && isAfterDueDay) return true
          }
          return false
        }).length

        const remaining = debt.installmentsCount - pastInstallmentsCount

        return remaining > 0 ? sum + remaining * debt.installmentsAmount : sum
      }, 0)

      return reply.status(200).send({ totalAmount })
    },
  )
}
