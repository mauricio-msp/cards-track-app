import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db'
import { cards, debts, members } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'
import { generateInstallmentCompetences } from '@/utils/generate-installment-competences'

type GroupedDebts = {
  groupId: string
  description: string
  purchaseDate: string
  category: string | null
  totalAmount: number
  installmentsCount: number
  elapsedInstallments: number // Representará a parcela atual visualizada (ex: o "2" de 2/10)
  remainingInstallments: number
  members: Array<{
    id: string
    name: string
    relationship: string
    installmentAmount: number
  }>
}

export const getCardDebts: FastifyPluginAsyncZod = async app => {
  app.get(
    '/api/cards/:cardId/debts',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Get card debts summary by month',
        tags: ['Cards'],
        params: z.object({
          cardId: z.string(),
        }),
        querystring: z.object({
          month: z.coerce.number().int().min(0).max(11).optional(),
          year: z.coerce.number().int().optional(),
        }),
        response: {
          200: z.object({
            debts: z.array(
              z.object({
                groupId: z.string(),
                description: z.string(),
                purchaseDate: z.string(),
                category: z.string().nullable(),
                totalAmount: z.number(),
                installmentsCount: z.number(),
                elapsedInstallments: z.number(),
                remainingInstallments: z.number(),
                members: z.array(
                  z.object({
                    id: z.string(),
                    name: z.string(),
                    relationship: z.string(),
                    installmentAmount: z.number(),
                  }),
                ),
              }),
            ),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user
      const { cardId } = request.params
      const { month, year } = request.query

      const [card] = await db
        .select()
        .from(cards)
        .where(and(eq(cards.id, cardId), eq(cards.ownerUserId, userId)))

      if (!card) return reply.status(404).send({ message: 'Card not found' })

      const rows = await db
        .select({ debt: debts, member: members })
        .from(debts)
        .innerJoin(members, eq(debts.memberId, members.id))
        .where(eq(debts.cardId, cardId))

      const now = new Date()
      const isAfterDueDay = now.getDate() > card.dueDay

      let targetMonth = month ?? (isAfterDueDay ? now.getMonth() + 1 : now.getMonth())
      let targetYear = year ?? now.getFullYear()

      if (month === undefined && targetMonth > 11) {
        targetMonth = 0
        targetYear++
      }

      // 3. Agrupamento e Filtragem em um único passo
      const grouped = new Map<string, GroupedDebts>()

      for (const { debt, member } of rows) {
        const comps = generateInstallmentCompetences(
          debt.invoiceMonth,
          debt.invoiceYear,
          debt.installmentsCount,
        )

        // Encontra o índice da parcela para o mês alvo
        const idx = comps.findIndex(c => c.month === targetMonth && c.year === targetYear)
        if (idx === -1) continue

        // Se não houver parcela neste mês e não for filtro apenas por ano, pula
        const matchesYearOnly =
          year !== undefined && month === undefined && comps.some(c => c.year === year)
        if (idx === -1 && !matchesYearOnly) continue

        const parcelNum = idx + 1

        const start = debt.startInstallment ?? 1
        const end = debt.endInstallment ?? debt.installmentsCount

        const isMemberResponsibleForThisParcel = parcelNum >= start && parcelNum <= end

        let group = grouped.get(debt.groupId)

        if (!group) {
          group = {
            groupId: debt.groupId,
            description: debt.description,
            purchaseDate: debt.purchaseDate,
            category: debt.category,
            totalAmount: 0,
            installmentsCount: debt.installmentsCount,
            elapsedInstallments: parcelNum,
            remainingInstallments: Math.max(debt.installmentsCount - parcelNum, 0),
            members: [],
          }
          grouped.set(debt.groupId, group)
        }

        if (isMemberResponsibleForThisParcel) {
          group.totalAmount += debt.installmentsAmount // Somamos apenas o que é devido no mês
          group.members.push({
            ...member,
            installmentAmount: debt.installmentsAmount,
          })
        }
      }

      // Remove grupos que ficaram sem nenhum membro pagante no mês específico (opcional)
      const result = Array.from(grouped.values()).filter(g => g.members.length > 0)

      return reply.status(200).send({ debts: result })
    },
  )
}
