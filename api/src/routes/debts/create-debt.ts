import { and, eq } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { uuidv7 } from 'uuidv7'
import { z } from 'zod'

import { db } from '@/db'
import { cards, debts, installments, invoices } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'
import { calculateInvoiceCompetence } from '@/utils/calculate-invoice-competence'

export const createDebt: FastifyPluginAsyncZod = async app => {
  app.post(
    '/api/debts',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Criar uma nova compra e gera as parcelas por membro',
        tags: ['Debts'],
        body: z.object({
          cardId: z.string().describe('ID do cartão utilizado'),
          members: z.array(
            z.object({
              id: z.string().describe('ID do membro da família/grupo'),
              name: z.string(),
              amount: z.coerce
                .number()
                .int()
                .positive()
                .describe('Valor total que este membro deve pagar'),
              startInstallment: z.coerce
                .number()
                .int()
                .min(1)
                .optional()
                .describe('Parcela inicial do membro'),
              endInstallment: z.coerce
                .number()
                .int()
                .min(1)
                .optional()
                .nullable()
                .describe('Parcela final do membro'),
            }),
          ),
          category: z.string().describe('Categoria da despesa (ex: Alimentação)'),
          description: z.string().describe('Descrição da compra'),
          installmentsCount: z.coerce
            .number()
            .int()
            .min(1)
            .describe('Quantidade total de parcelas da compra'),
          purchaseDate: z.string().describe('Data da compra (ISO string)'),
        }),
        response: {
          201: z.object({
            debts: z.array(createSelectSchema(debts)),
            message: z.string(),
          }),
          400: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { cardId, members, description, category, installmentsCount, purchaseDate } =
        request.body

      try {
        const userId = request.user.id
        const groupId = uuidv7()

        const [card] = await db
          .select({
            id: cards.id,
            closingOffsetDays: cards.closingOffsetDays,
            dueDay: cards.dueDay,
          })
          .from(cards)
          .where(and(eq(cards.id, cardId), eq(cards.ownerUserId, userId)))

        if (!card) {
          return reply.status(400).send({
            message: 'Cartão não encontrado ou não pertence ao usuário',
          })
        }

        const [datePart] = purchaseDate.split('T')
        const purchaseDateResetHours = new Date(`${datePart}T00:00:00`)

        const { invoiceMonth, invoiceYear } = calculateInvoiceCompetence(
          purchaseDateResetHours,
          card.dueDay,
          card.closingOffsetDays,
        )

        const createdDebts = await db.transaction(async tx => {
          let [firstInvoice] = await tx
            .select()
            .from(invoices)
            .where(
              and(
                eq(invoices.cardId, cardId),
                eq(invoices.month, invoiceMonth),
                eq(invoices.year, invoiceYear),
              ),
            )

          if (!firstInvoice) {
            const dueDate = new Date(invoiceYear, invoiceMonth, card.dueDay)

            const [newInv] = await tx
              .insert(invoices)
              .values({
                cardId,
                month: invoiceMonth,
                year: invoiceYear,
                dueDate,
              })
              .returning()

            firstInvoice = newInv
          }

          const debtsToInsert = members.map(member => {
            const start = member.startInstallment ?? 1
            const end = member.endInstallment ?? installmentsCount
            const memberActiveInstallments = end - start + 1

            if (memberActiveInstallments <= 0 || end > installmentsCount) {
              throw new Error(`Intervalo de parcelas inválido para o membro ${member.name}`)
            }

            const singleInstallmentValue = Math.round(member.amount / installmentsCount)
            const totalMemberAmount = singleInstallmentValue * memberActiveInstallments

            return {
              groupId,
              cardId,
              memberId: member.id,
              invoiceId: firstInvoice.id,
              description,
              category,
              amount: totalMemberAmount,
              installmentsCount,
              installmentsAmount: singleInstallmentValue,
              purchaseDate: purchaseDateResetHours.toISOString(),
              invoiceMonth,
              invoiceYear,
              startInstallment: start,
              endInstallment: end,
            }
          })

          const insertedDebts = await tx.insert(debts).values(debtsToInsert).returning()

          for (const debt of insertedDebts) {
            const start = debt.startInstallment ?? 1
            const end = debt.endInstallment ?? installmentsCount

            for (let i = 0; i < installmentsCount; i++) {
              const currentInstallmentNum = i + 1

              if (currentInstallmentNum < start || currentInstallmentNum > end) {
                continue
              }

              let m = invoiceMonth + i
              let y = invoiceYear
              while (m > 11) {
                m -= 12
                y++
              }

              let [invoice] = await tx
                .select()
                .from(invoices)
                .where(
                  and(eq(invoices.cardId, cardId), eq(invoices.month, m), eq(invoices.year, y)),
                )

              if (!invoice) {
                const dueDate = new Date(y, m, card.dueDay)
                const [newInv] = await tx
                  .insert(invoices)
                  .values({
                    id: uuidv7(),
                    cardId,
                    month: m,
                    year: y,
                    dueDate,
                  })
                  .returning()
                invoice = newInv
              }

              await tx.insert(installments).values({
                debtId: debt.id,
                memberId: debt.memberId,
                invoiceId: invoice.id,
                number: currentInstallmentNum,
                amount: debt.installmentsAmount,
              })
            }
          }

          return insertedDebts
        })

        return reply.status(201).send({
          debts: createdDebts,
          message: 'Despesas e parcelas registradas com sucesso!',
        })
      } catch (error) {
        request.log.error(error)
        const errorMessage = error instanceof Error ? error.message : 'Erro ao registrar despesa(s)'

        return reply.status(400).send({
          message: errorMessage,
        })
      }
    },
  )
}
