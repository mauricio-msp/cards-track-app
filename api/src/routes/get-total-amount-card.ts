import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '@/db'
import { cards, debts } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'
import { generateInstallmentCompetences } from '@/utils/generate-installment-competences'

export const getTotalAmountCard: FastifyPluginAsyncZod = async app => {
  app.get(
    '/api/cards/:cardId/total-amount',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Get total outstanding balance (future installments)',
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

      if (!card) return reply.status(404).send({ message: 'Card not found' })

      const rows = await db
        .select({
          groupId: debts.groupId,
          description: debts.description,
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
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()

      const isAfterDueDay = now.getDate() > card.dueDay
      let targetMonth = currentMonth
      let targetYear = currentYear

      if (isAfterDueDay) {
        targetMonth++
        if (targetMonth > 11) {
          targetMonth = 0
          targetYear++
        }
      }

      const grouped = rows.reduce(
        (acc, debt) => {
          const key = debt.groupId

          if (!acc[key]) {
            acc[key] = {
              description: debt.description,
              invoiceMonth: debt.invoiceMonth,
              invoiceYear: debt.invoiceYear,
              installmentsCount: debt.installmentsCount,
              installmentsAmount: 0,
            }
          }

          if (debt.startInstallment && debt.endInstallment) {
            acc[key].installmentsAmount = debt.installmentsAmount
          } else {
            acc[key].installmentsAmount += debt.installmentsAmount
          }

          return acc
        },
        {} as Record<
          string,
          {
            description: string
            invoiceMonth: number
            invoiceYear: number
            installmentsCount: number
            installmentsAmount: number
          }
        >,
      )

      const totalAmountCard = Object.values(grouped).reduce((sum, debt) => {
        const competences = generateInstallmentCompetences(
          debt.invoiceMonth,
          debt.invoiceYear,
          debt.installmentsCount,
        )

        // Agora contamos apenas as competências que são IGUAIS ou MAIORES que o alvo
        const remaining = competences.filter(c => {
          if (c.year > targetYear) return true
          if (c.year === targetYear && c.month >= targetMonth) return true
          return false
        }).length

        const amountToSum = remaining * debt.installmentsAmount

        return sum + amountToSum
      }, 0)

      return reply.send({ totalAmountCard })
    },
  )
}
