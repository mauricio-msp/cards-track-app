import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db'
import { cards, installments, invoices } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'

export const payInstallment: FastifyPluginAsyncZod = async app => {
  app.patch(
    '/api/installments/:installmentId/pay',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Marcar parcela como paga',
        description:
          'Atualiza o "paidAt" de uma parcela específica. Idempotente — se já estiver paga, atualiza o timestamp silenciosamente.',
        tags: ['Installments'],
        params: z.object({
          installmentId: z.string(),
        }),
        response: {
          200: z.object({
            installmentId: z.string(),
            paidAt: z.string(),
          }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user
      const { installmentId } = request.params

      const [existing] = await db
        .select({ id: installments.id })
        .from(installments)
        .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
        .innerJoin(cards, and(eq(invoices.cardId, cards.id), eq(cards.ownerUserId, userId)))
        .where(eq(installments.id, installmentId))
        .limit(1)

      if (!existing) {
        return reply.status(404).send({ message: 'Parcela não encontrada!' })
      }

      const paidAt = new Date()

      await db.update(installments).set({ paidAt }).where(eq(installments.id, installmentId))

      return reply.status(200).send({
        installmentId,
        paidAt: paidAt.toISOString(),
      })
    },
  )
}
