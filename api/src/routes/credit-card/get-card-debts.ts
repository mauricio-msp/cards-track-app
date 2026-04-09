import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { uuidv7 } from 'uuidv7'
import { z } from 'zod'

import { db } from '@/db'
import { cards, debts, installments, invoices, members, subscriptions } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'
import { calculateInvoiceCompetence } from '@/utils/calculate-invoice-competence'
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
  subscriptionId: string | null
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
                subscriptionId: z.string().nullable(),
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

      // Auto-generate subscription debts for the queried period
      const activeSubscriptions = await db
        .select()
        .from(subscriptions)
        .where(and(eq(subscriptions.cardId, cardId), eq(subscriptions.active, true)))

      for (const sub of activeSubscriptions) {
        // Clamp billingDay to valid day in targetMonth (0-indexed → 1-indexed for Date)
        const actualMonth = targetMonth + 1
        const lastDayOfMonth = new Date(targetYear, actualMonth, 0).getDate()
        const day = Math.min(sub.billingDay, lastDayOfMonth)

        const purchaseDateStr = `${targetYear}-${String(actualMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        const purchaseDate = new Date(`${purchaseDateStr}T00:00:00`)

        const { invoiceMonth, invoiceYear } = calculateInvoiceCompetence(
          purchaseDate,
          card.dueDay,
          card.closingOffsetDays,
        )

        // Only generate if this subscription maps to the queried period
        if (invoiceMonth !== targetMonth || invoiceYear !== targetYear) continue

        // Check if already generated for this period
        const [existing] = await db
          .select({ id: debts.id })
          .from(debts)
          .where(
            and(
              eq(debts.subscriptionId, sub.id),
              eq(debts.invoiceMonth, invoiceMonth),
              eq(debts.invoiceYear, invoiceYear),
            ),
          )

        if (existing) continue

        // Get or create invoice for this period
        let [invoice] = await db
          .select()
          .from(invoices)
          .where(
            and(
              eq(invoices.cardId, cardId),
              eq(invoices.month, invoiceMonth),
              eq(invoices.year, invoiceYear),
            ),
          )

        if (!invoice) {
          const dueDate = new Date(invoiceYear, invoiceMonth, card.dueDay)
          const [newInv] = await db
            .insert(invoices)
            .values({ cardId, month: invoiceMonth, year: invoiceYear, dueDate })
            .returning()
          invoice = newInv
        }

        const groupId = uuidv7()

        const [newDebt] = await db
          .insert(debts)
          .values({
            groupId,
            cardId,
            memberId: sub.memberId,
            invoiceId: invoice.id,
            description: sub.name,
            category: 'Assinatura',
            amount: sub.amount,
            installmentsCount: 1,
            installmentsAmount: sub.amount,
            purchaseDate: purchaseDateStr,
            invoiceMonth,
            invoiceYear,
            startInstallment: 1,
            endInstallment: 1,
            subscriptionId: sub.id,
          })
          .returning()

        await db.insert(installments).values({
          debtId: newDebt.id,
          memberId: sub.memberId,
          invoiceId: invoice.id,
          number: 1,
          amount: sub.amount,
        })
      }

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
            anticipateFromInstallment: debt.anticipatedAt ? currentInstallment : null,
            subscriptionId: debt.subscriptionId ?? null,
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