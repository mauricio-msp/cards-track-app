import { and, eq, isNull, sql } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db'
import { cards, debts, installments, invoices } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'
import { resolveTargetPeriod } from '@/utils/resolve-target-period'

export const anticipateDebt: FastifyPluginAsyncZod = async app => {
  app.patch(
    '/api/debts/:debtId/anticipate',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Antecipar parcelas de uma compra',
        description:
          'Consolida as parcelas futuras a partir de um número escolhido em um único installment na fatura atual em aberto.',
        tags: ['Debts'],
        params: z.object({
          debtId: z.string(),
        }),
        body: z.object({
          anticipateFromInstallment: z.coerce
            .number()
            .int()
            .min(1)
            .describe('Número da parcela a partir da qual antecipar (inclusive)'),
        }),
        response: {
          200: z.object({
            message: z.string(),
            anticipatedAmount: z.number(),
            installmentsAnticipated: z.number(),
          }),
          400: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user
      const { debtId } = request.params
      const { anticipateFromInstallment } = request.body

      // 1. Busca o debt e valida ownership via card
      const [debt] = await db
        .select({
          id: debts.id,
          groupId: debts.groupId,
          cardId: debts.cardId,
          memberId: debts.memberId,
          installmentsCount: debts.installmentsCount,
          installmentsAmount: debts.installmentsAmount,
          anticipatedAt: debts.anticipatedAt,
          card: {
            dueDay: cards.dueDay,
          },
        })
        .from(debts)
        .innerJoin(cards, and(eq(debts.cardId, cards.id), eq(cards.ownerUserId, userId)))
        .where(eq(debts.id, debtId))
        .limit(1)

      if (!debt) {
        return reply.status(404).send({ message: 'Debt not found' })
      }

      // 2. Valida que já não foi antecipada
      if (debt.anticipatedAt) {
        return reply.status(400).send({ message: 'Debt already anticipated' })
      }

      // 3. Valida que não há divisão de membros (único debt no groupId)
      const [{ count }] = await db
        .select({ count: sql<number>`COUNT(*)`.mapWith(Number) })
        .from(debts)
        .where(eq(debts.groupId, debt.groupId))

      if (count > 1) {
        return reply.status(400).send({
          message: 'Cannot anticipate a debt shared between members',
        })
      }

      // 4. Busca os installments ainda não pagos
      const unpaidInstallments = await db
        .select({ number: installments.number })
        .from(installments)
        .where(and(eq(installments.debtId, debtId), isNull(installments.paidAt)))
        .orderBy(installments.number)

      if (unpaidInstallments.length === 0) {
        return reply.status(400).send({ message: 'No unpaid installments to anticipate' })
      }

      const firstUnpaidNumber = unpaidInstallments[0].number

      // 5. Tentou antecipar uma parcela já paga
      if (anticipateFromInstallment < firstUnpaidNumber) {
        return reply.status(400).send({
          message: `You can only anticipate from an unpaid installment. First allowed is ${firstUnpaidNumber}`,
        })
      }

      // 6. Passou do limite
      if (anticipateFromInstallment > debt.installmentsCount) {
        return reply.status(400).send({
          message: `Invalid installment number. Last installment is ${debt.installmentsCount}`,
        })
      }

      // 7. Calcula quantas parcelas serão antecipadas e o valor consolidado
      const installmentsToAnticipate = debt.installmentsCount - anticipateFromInstallment + 1
      const anticipatedAmount = installmentsToAnticipate * debt.installmentsAmount

      await db.transaction(async tx => {
        // 8. Deleta os installments a partir de anticipateFromInstallment
        await tx
          .delete(installments)
          .where(
            and(
              eq(installments.debtId, debtId),
              sql`${installments.number} >= ${anticipateFromInstallment}`,
            ),
          )

        // 9. Usa resolveTargetPeriod — aponta para fatura em aberto
        const { targetMonth: invoiceMonth, targetYear: invoiceYear } = resolveTargetPeriod(
          debt.card.dueDay,
        )

        let [currentInvoice] = await tx
          .select()
          .from(invoices)
          .where(
            and(
              eq(invoices.cardId, debt.cardId),
              eq(invoices.month, invoiceMonth),
              eq(invoices.year, invoiceYear),
            ),
          )

        if (!currentInvoice) {
          const dueDate = new Date(invoiceYear, invoiceMonth, debt.card.dueDay)
          const [newInvoice] = await tx
            .insert(invoices)
            .values({
              cardId: debt.cardId,
              month: invoiceMonth,
              year: invoiceYear,
              dueDate,
            })
            .returning()
          currentInvoice = newInvoice
        }

        // 10. Insere 1 installment consolidado na invoice atual em aberto
        await tx.insert(installments).values({
          debtId,
          memberId: debt.memberId,
          invoiceId: currentInvoice.id,
          number: anticipateFromInstallment,
          amount: anticipatedAmount,
        })

        // 11. Marca o debt como antecipado
        await tx.update(debts).set({ anticipatedAt: new Date() }).where(eq(debts.id, debtId))
      })

      return reply.status(200).send({
        message: 'Installments anticipated successfully',
        anticipatedAmount,
        installmentsAnticipated: installmentsToAnticipate,
      })
    },
  )
}

// import { and, eq, isNull, sql } from 'drizzle-orm'
// import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
// import { z } from 'zod'

// import { db } from '@/db'
// import { cards, debts, installments, invoices } from '@/db/schema'
// import { authMiddleware } from '@/middleware/auth'
// import { resolveTargetPeriod } from '@/utils/resolve-target-period'

// export const anticipateDebt: FastifyPluginAsyncZod = async app => {
//   app.patch(
//     '/api/debts/:debtId/anticipate',
//     {
//       preHandler: [authMiddleware],
//       schema: {
//         summary: 'Antecipar parcelas de uma compra',
//         description:
//           'Consolida as parcelas futuras a partir de um número escolhido em um único installment na fatura atual em aberto.',
//         tags: ['Debts'],
//         params: z.object({
//           debtId: z.string(),
//         }),
//         body: z.object({
//           anticipateFromInstallment: z.coerce
//             .number()
//             .int()
//             .min(1)
//             .describe('Número da parcela a partir da qual antecipar (inclusive)'),
//         }),
//         response: {
//           200: z.object({
//             message: z.string(),
//             anticipatedAmount: z.number(),
//             installmentsAnticipated: z.number(),
//           }),
//           400: z.object({ message: z.string() }),
//           404: z.object({ message: z.string() }),
//         },
//       },
//     },
//     async (request, reply) => {
//       const { id: userId } = request.user
//       const { debtId } = request.params
//       const { anticipateFromInstallment } = request.body

//       // 1. Busca o debt e valida ownership via card
//       const [debt] = await db
//         .select({
//           id: debts.id,
//           groupId: debts.groupId,
//           cardId: debts.cardId,
//           memberId: debts.memberId,
//           installmentsCount: debts.installmentsCount,
//           installmentsAmount: debts.installmentsAmount,
//           anticipatedAt: debts.anticipatedAt,
//           card: {
//             dueDay: cards.dueDay, // ✅ closingOffsetDays removido
//           },
//         })
//         .from(debts)
//         .innerJoin(cards, and(
//           eq(debts.cardId, cards.id),
//           eq(cards.ownerUserId, userId),
//         ))
//         .where(eq(debts.id, debtId))
//         .limit(1)

//       if (!debt) {
//         return reply.status(404).send({ message: 'Debt not found' })
//       }

//       // 2. Valida que já não foi antecipada
//       if (debt.anticipatedAt) {
//         return reply.status(400).send({ message: 'Debt already anticipated' })
//       }

//       // 3. Valida que não há divisão de membros (único debt no groupId)
//       const [{ count }] = await db
//         .select({ count: sql<number>`COUNT(*)`.mapWith(Number) })
//         .from(debts)
//         .where(eq(debts.groupId, debt.groupId))

//       if (count > 1) {
//         return reply.status(400).send({
//           message: 'Cannot anticipate a debt shared between members',
//         })
//       }

//       // 4. Busca os installments ainda não pagos
//       const unpaidInstallments = await db
//         .select({ number: installments.number })
//         .from(installments)
//         .where(and(
//           eq(installments.debtId, debtId),
//           isNull(installments.paidAt),
//         ))
//         .orderBy(installments.number)

//       if (unpaidInstallments.length === 0) {
//         return reply.status(400).send({ message: 'No unpaid installments to anticipate' })
//       }

//       const firstUnpaidNumber = unpaidInstallments[0].number
//       const firstAllowedInstallment = firstUnpaidNumber + 1

//       // 5. Não há parcelas futuras após a atual
//       if (firstUnpaidNumber >= debt.installmentsCount) {
//         return reply.status(400).send({
//           message: 'No future installments to anticipate',
//         })
//       }

//       // 6. Tentou incluir a parcela atual ou uma já paga
//       if (anticipateFromInstallment < firstAllowedInstallment) {
//         return reply.status(400).send({
//           message: `You can only anticipate installments after the current one. First allowed is ${firstAllowedInstallment}`,
//         })
//       }

//       // 7. Passou do limite
//       if (anticipateFromInstallment > debt.installmentsCount) {
//         return reply.status(400).send({
//           message: `Invalid installment number. Last installment is ${debt.installmentsCount}`,
//         })
//       }

//       // 8. Calcula quantas parcelas serão antecipadas e o valor consolidado
//       const installmentsToAnticipate = debt.installmentsCount - anticipateFromInstallment + 1
//       const anticipatedAmount = installmentsToAnticipate * debt.installmentsAmount

//       await db.transaction(async tx => {
//         // 9. Deleta os installments futuros (>= anticipateFromInstallment)
//         await tx
//           .delete(installments)
//           .where(and(
//             eq(installments.debtId, debtId),
//             sql`${installments.number} >= ${anticipateFromInstallment}`,
//           ))

//         // 10. ✅ Usa resolveTargetPeriod — aponta para fatura em aberto sem closingOffsetDays
//         const { targetMonth: invoiceMonth, targetYear: invoiceYear } = resolveTargetPeriod(
//           debt.card.dueDay,
//         )

//         let [currentInvoice] = await tx
//           .select()
//           .from(invoices)
//           .where(and(
//             eq(invoices.cardId, debt.cardId),
//             eq(invoices.month, invoiceMonth),
//             eq(invoices.year, invoiceYear),
//           ))

//         if (!currentInvoice) {
//           const dueDate = new Date(invoiceYear, invoiceMonth, debt.card.dueDay)
//           const [newInvoice] = await tx
//             .insert(invoices)
//             .values({
//               cardId: debt.cardId,
//               month: invoiceMonth,
//               year: invoiceYear,
//               dueDate,
//             })
//             .returning()
//           currentInvoice = newInvoice
//         }

//         // 11. Insere 1 installment consolidado na invoice atual em aberto
//         await tx.insert(installments).values({
//           debtId,
//           memberId: debt.memberId,
//           invoiceId: currentInvoice.id,
//           number: anticipateFromInstallment,
//           amount: anticipatedAmount,
//         })

//         // 12. Marca o debt como antecipado
//         await tx
//           .update(debts)
//           .set({ anticipatedAt: new Date() })
//           .where(eq(debts.id, debtId))
//       })

//       return reply.status(200).send({
//         message: 'Installments anticipated successfully',
//         anticipatedAmount,
//         installmentsAnticipated: installmentsToAnticipate,
//       })
//     },
//   )
// }
