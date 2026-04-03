import { and, eq, sql } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db'
import { cards, debts, installments, invoices, members } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'

type CardSummary = {
  id: string
  name: string
  dueDay: number
  targetYear: number
  targetMonth: number
}

type DebtEntry = {
  id: string
  description: string
  purchaseDate: string
  amount: number
  installmentsCount: number
  installmentsAmount: number
  elapsedInstallments: number
  remainingInstallments: number
  anticipatedAt: string | null
  anticipatedInstallmentsCount: number | null
  anticipateFromInstallment: number | null
}

export const getMemberDebts: FastifyPluginAsyncZod = async app => {
  app.get(
    '/api/members/:memberId/debts-by-card',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Obter despesas de um membro agrupadas por cartão',
        description:
          'Retorna as parcelas de um membro específico, calculando a fatura correta para cada cartão via CASE WHEN no banco — sem N+1 queries.',
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
                  dueDay: z.number(),
                  targetYear: z.number(),
                  targetMonth: z.number(),
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
                    anticipatedAt: z.string().nullable(),
                    anticipatedInstallmentsCount: z.number().nullish(),
                    anticipateFromInstallment: z.number().nullish(),
                  }),
                ),
              }),
            ),
          }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user
      const { memberId } = request.params
      const { month, year } = request.query

      const [member] = await db
        .select({ id: members.id })
        .from(members)
        .where(and(eq(members.id, memberId), eq(members.userId, userId)))
        .limit(1)

      if (!member) {
        return reply.status(404).send({ message: 'Membro não encontrado' })
      }

      const now = new Date()
      const today = now.getDate()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()

      const todaySQL = sql<number>`${today}::int`
      const currentMonthSQL = sql<number>`${currentMonth}::int`
      const currentYearSQL = sql<number>`${currentYear}::int`
      const nextYearSQL = sql<number>`${currentYear + 1}::int`

      const targetMonthExpr =
        month !== undefined
          ? sql<number>`${month}::int`
          : sql<number>`
              CASE
                WHEN ${todaySQL} > ${cards.dueDay}
                  THEN (${currentMonthSQL} + 1) % 12
                ELSE ${currentMonthSQL}
              END
            `

      const targetYearExpr =
        year !== undefined
          ? sql<number>`${year}::int`
          : sql<number>`
              CASE
                WHEN ${todaySQL} > ${cards.dueDay} AND ${currentMonthSQL} = 11
                  THEN ${nextYearSQL}
                ELSE ${currentYearSQL}
              END
            `

      const rows = await db
        .select({
          card: {
            id: cards.id,
            name: cards.name,
            dueDay: cards.dueDay,
          },
          debt: {
            id: debts.id,
            description: debts.description,
            purchaseDate: debts.purchaseDate,
            amount: debts.amount,
            installmentsCount: debts.installmentsCount,
            startInstallment: debts.startInstallment,
            endInstallment: debts.endInstallment,
            anticipatedAt: debts.anticipatedAt, // ✅
          },
          installment: {
            number: installments.number,
            amount: installments.amount,
          },
          targetMonth: targetMonthExpr,
          targetYear: targetYearExpr,
        })
        .from(cards)
        .innerJoin(
          invoices,
          and(
            eq(invoices.cardId, cards.id),
            eq(invoices.month, targetMonthExpr),
            eq(invoices.year, targetYearExpr),
          ),
        )
        .innerJoin(
          installments,
          and(eq(installments.invoiceId, invoices.id), eq(installments.memberId, memberId)),
        )
        .innerJoin(debts, eq(installments.debtId, debts.id))
        .where(eq(cards.ownerUserId, userId))

      const cardMap = new Map<string, { card: CardSummary; debts: DebtEntry[] }>()

      for (const row of rows) {
        const currentInstallment = row.installment.number
        const start = row.debt.startInstallment
        const end = row.debt.endInstallment ?? row.debt.installmentsCount

        if (currentInstallment < start || currentInstallment > end) continue

        if (!cardMap.has(row.card.id)) {
          cardMap.set(row.card.id, {
            card: {
              id: row.card.id,
              name: row.card.name,
              dueDay: row.card.dueDay,
              targetMonth: Number(row.targetMonth),
              targetYear: Number(row.targetYear),
            },
            debts: [],
          })
        }

        const cardEntry = cardMap.get(row.card.id)
        if (!cardEntry) continue

        const isAnticipated = !!row.debt.anticipatedAt

        // Mesmo cálculo do getCardDebts para consistência
        const anticipatedCount = isAnticipated
          ? row.debt.installmentsCount - currentInstallment + 1
          : 0

        const remainingInstallments = isAnticipated
          ? Math.max(row.debt.installmentsCount - (currentInstallment + anticipatedCount - 1), 0)
          : Math.max(row.debt.installmentsCount - currentInstallment, 0)

        cardEntry.debts.push({
          id: row.debt.id,
          description: row.debt.description,
          purchaseDate: row.debt.purchaseDate,
          amount: row.debt.amount,
          installmentsCount: row.debt.installmentsCount,
          installmentsAmount: Number(row.installment.amount),
          elapsedInstallments: currentInstallment,
          remainingInstallments,
          anticipatedAt: row.debt.anticipatedAt?.toISOString() ?? null,
          anticipatedInstallmentsCount: isAnticipated ? anticipatedCount : null,
          anticipateFromInstallment: isAnticipated ? currentInstallment : null,
        })
      }

      return reply.send({
        cardsWithDebts: Array.from(cardMap.values()),
      })
    },
  )
}
