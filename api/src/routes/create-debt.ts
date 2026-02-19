import { and, eq } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { uuidv7 } from 'uuidv7'
import { z } from 'zod'

import { db } from '@/db'
import { cards, debts } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'
import { calculateInvoiceCompetence } from '@/utils/calculate-invoice-competence'

export const createDebt: FastifyPluginAsyncZod = async app => {
  app.post(
    '/api/debts',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Create a new purchase and generate debts per member',
        tags: ['Debts'],
        body: z.object({
          cardId: z.string(),
          members: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              amount: z.coerce.number().int().positive(),
              // Novos campos opcionais para revezamento
              startInstallment: z.coerce.number().int().min(1).optional(),
              endInstallment: z.coerce.number().int().min(1).optional(),
            }),
          ),
          category: z.string(),
          description: z.string(),
          installmentsCount: z.coerce.number().int().min(1),
          purchaseDate: z.string(),
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
            message: 'Card not found or does not belong to user',
          })
        }

        const [datePart] = purchaseDate.split('T')
        const purchaseDateResetHours = new Date(`${datePart}T00:00:00`)

        // 🧾 primeira fatura correta
        const { invoiceMonth, invoiceYear } = calculateInvoiceCompetence(
          purchaseDateResetHours,
          card.dueDay,
          card.closingOffsetDays,
        )

        const debtsToInsert = members.map(member => {
          // Determina o intervalo real
          const start = member.startInstallment ?? 1
          const end = member.endInstallment ?? installmentsCount

          // Calcula quantas parcelas este membro pagará de fato
          // Ex: De 4 a 6 -> (6 - 4) + 1 = 3 parcelas
          const memberActiveInstallments = end - start + 1

          if (memberActiveInstallments <= 0 || end > installmentsCount) {
            throw new Error(`Invalid installment range for member ${member.name}`)
          }

          // O valor da parcela do membro é o valor total DELE
          // dividido por QUANTAS VEZES ele vai pagar
          const installmentsAmount = member.amount / memberActiveInstallments

          return {
            groupId,
            cardId,
            memberId: member.id,
            description,
            category,
            amount: member.amount,
            installmentsCount,
            installmentsAmount,
            purchaseDate: purchaseDateResetHours.toISOString(),
            invoiceMonth,
            invoiceYear,
          }
        })

        const createdDebts = await db.insert(debts).values(debtsToInsert).returning()

        return reply.status(201).send({
          debts: createdDebts,
          message: 'Debts registered successfully',
        })
      } catch (error) {
        request.log.error(error)

        return reply.status(400).send({
          message: 'Failed to create debt(s)',
        })
      }
    },
  )
}
