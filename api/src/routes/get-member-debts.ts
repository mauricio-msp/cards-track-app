import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db'
import { cards, debts } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'
import { generateInstallmentCompetences } from '@/utils/generate-installment-competences'

type Card = {
  id: string
  name: string
  dueDay: number
  targetYear: number
  targetMonth: number
}

type Debts = Array<{
  id: string
  description: string
  purchaseDate: string
  amount: number
  installmentsCount: number
  installmentsAmount: number
  elapsedInstallments: number
  remainingInstallments: number
}>

export const getMemberDebts: FastifyPluginAsyncZod = async app => {
  app.get(
    '/api/members/:memberId/debts-by-card',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Busca dívidas do membro com lógica de fatura atual (pula mês se já venceu)',
        tags: ['Members'],
        params: z.object({ memberId: z.string() }),
        querystring: z.object({
          month: z.coerce.number().int().min(0).max(11).optional(),
          year: z.coerce.number().int().optional(),
        }),
        response: {
          200: z.object({
            cardsWithDebts: z.array(
              z.object({
                card: z.object({
                  id: z.string(),
                  name: z.string(),
                  dueDay: z.coerce.number(),
                  targetYear: z.coerce.number(),
                  targetMonth: z.coerce.number(),
                }),
                debts: z.array(
                  z.object({
                    id: z.string(),
                    description: z.string(),
                    purchaseDate: z.string(),
                    amount: z.number(),
                    installmentsCount: z.number(),
                    installmentsAmount: z.number(),
                    elapsedInstallments: z.number(),
                    remainingInstallments: z.number(),
                  }),
                ),
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user
      const { memberId } = request.params
      const { month, year } = request.query

      const now = new Date()
      const today = now.getDate()

      const rows = await db
        .select({
          debt: {
            id: debts.id,
            description: debts.description,
            purchaseDate: debts.purchaseDate,
            amount: debts.amount,
            installmentsCount: debts.installmentsCount,
            installmentsAmount: debts.installmentsAmount,
            startInstallment: debts.startInstallment,
            endInstallment: debts.endInstallment,
            invoiceMonth: debts.invoiceMonth,
            invoiceYear: debts.invoiceYear,
          },
          card: {
            id: cards.id,
            name: cards.name,
            dueDay: cards.dueDay,
          },
        })
        .from(debts)
        .innerJoin(cards, eq(debts.cardId, cards.id))
        .where(and(eq(debts.memberId, memberId), eq(cards.ownerUserId, userId)))

      const grouped = new Map<string, { card: Card; debts: Debts }>()

      for (const { debt, card } of rows) {
        let cardTargetMonth = month ?? now.getMonth()
        let cardTargetYear = year ?? now.getFullYear()

        if (month === undefined && today > card.dueDay) {
          const nextDate = new Date(cardTargetYear, cardTargetMonth + 1, 1)
          cardTargetMonth = nextDate.getMonth()
          cardTargetYear = nextDate.getFullYear()
        }

        const competences = generateInstallmentCompetences(
          debt.invoiceMonth,
          debt.invoiceYear,
          debt.installmentsCount,
        )

        const installmentIndex = competences.findIndex(
          c => c.month === cardTargetMonth && c.year === cardTargetYear,
        )

        // Se essa dívida não tem parcela na fatura ativa desse cartão, ignora
        if (installmentIndex === -1) continue

        const currentParcelNumber = installmentIndex + 1

        const start = debt.startInstallment ?? 1
        const end = debt.endInstallment ?? debt.installmentsCount

        if (currentParcelNumber < start || currentParcelNumber > end) continue

        if (!grouped.has(card.id)) {
          grouped.set(card.id, {
            card: { ...card, targetMonth: cardTargetMonth, targetYear: cardTargetYear },
            debts: [],
          })
        }

        grouped.get(card.id)?.debts.push({
          id: debt.id,
          description: debt.description,
          purchaseDate: debt.purchaseDate,
          amount: debt.amount,
          installmentsCount: debt.installmentsCount,
          installmentsAmount: debt.installmentsAmount,
          elapsedInstallments: currentParcelNumber,
          remainingInstallments: Math.max(debt.installmentsCount - currentParcelNumber, 0),
        })
      }

      return reply.send({
        cardsWithDebts: Array.from(grouped.values()),
      })
    },
  )
}
