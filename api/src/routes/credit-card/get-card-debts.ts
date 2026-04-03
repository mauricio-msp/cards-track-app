import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db'
import { cards, debts, installments, invoices, members } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'
import { resolveTargetPeriod } from '@/utils/resolve-target-period'

type GroupedDebts = {
  debtId: string
  groupId: string
  description: string
  purchaseDate: string
  category: string | null
  totalAmount: number
  installmentsCount: number
  elapsedInstallments: number
  remainingInstallments: number
  anticipatedAt: string | null
  anticipatedInstallmentsCount: number | null
  anticipateFromInstallment: number | null
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
        summary: 'Obter resumo de despesas do cartão por mês',
        description:
          'Lista todas as despesas vinculadas a um cartão em um mês específico, agrupando os membros responsáveis e detalhando o progresso das parcelas.',
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
                debtId: z.string(),
                groupId: z.string(),
                description: z.string(),
                purchaseDate: z.string(),
                category: z.string().nullable(),
                totalAmount: z.number(),
                installmentsCount: z.number(),
                elapsedInstallments: z.number(),
                remainingInstallments: z.number(),
                anticipatedAt: z.string().nullable(),
                anticipatedInstallmentsCount: z.number().nullable(),
                anticipateFromInstallment: z.number().nullable(),
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

      if (!card) return reply.status(404).send({ message: 'Cartão não encontrado' })

      const { targetMonth, targetYear } = resolveTargetPeriod(card.dueDay, month, year)

      const rows = await db
        .select({
          debt: debts,
          member: members,
          installment: installments,
        })
        .from(installments)
        .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
        .innerJoin(debts, eq(installments.debtId, debts.id))
        .innerJoin(members, eq(installments.memberId, members.id))
        .where(
          and(
            eq(invoices.cardId, cardId),
            eq(invoices.month, targetMonth),
            eq(invoices.year, targetYear),
          ),
        )

      const grouped = new Map<string, GroupedDebts>()

      for (const { installment, debt, member } of rows) {
        const currentInstallment = installment.number
        const start = debt.startInstallment
        const end = debt.endInstallment ?? debt.installmentsCount

        if (currentInstallment < start || currentInstallment > end) continue

        let group = grouped.get(debt.groupId)

        if (!group) {
          const anticipatedCount = debt.anticipatedAt
            ? debt.installmentsCount - currentInstallment + 1
            : 0
            
        
          const remainingInstallments = debt.anticipatedAt
            ? Math.max(debt.installmentsCount - (currentInstallment + anticipatedCount - 1), 0)
            : Math.max(debt.installmentsCount - currentInstallment, 0)
        
          group = {
            debtId: debt.id,
            groupId: debt.groupId,
            description: debt.description,
            purchaseDate: debt.purchaseDate,
            category: debt.category,
            totalAmount: 0,
            installmentsCount: debt.installmentsCount,
            elapsedInstallments: currentInstallment,
            remainingInstallments,
            anticipatedAt: debt.anticipatedAt?.toISOString() ?? null,
            anticipatedInstallmentsCount: debt.anticipatedAt
              ? debt.installmentsCount - currentInstallment + 1
              : null,
            anticipateFromInstallment: debt.anticipatedAt ? currentInstallment : null, // ✅
            members: [],
          }
          grouped.set(debt.groupId, group)
        }

        const amount = Number(installment.amount)
        group.totalAmount += amount
        group.members.push({
          id: member.id,
          name: member.name,
          relationship: member.relationship,
          installmentAmount: amount,
        })
      }

      const result = Array.from(grouped.values()).filter(g => g.members.length > 0)

      return reply.status(200).send({ debts: result })
    },
  )
}