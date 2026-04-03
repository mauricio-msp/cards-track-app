import { and, eq, isNotNull } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db'
import { cards, installments, invoices } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'

export const unpayInstallment: FastifyPluginAsyncZod = async app => {
  app.patch(
    '/api/installments/:installmentId/unpay',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Desfazer pagamento de parcela',
        description: 'Limpa o paidAt de uma parcela, revertendo para pendente.',
        tags: ['Installments'],
        params: z.object({ installmentId: z.string() }),
        response: {
          200: z.object({ message: z.string() }),
          400: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user
      const { installmentId } = request.params

      const [existing] = await db
        .select({ id: installments.id, paidAt: installments.paidAt })
        .from(installments)
        .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
        .innerJoin(cards, and(eq(invoices.cardId, cards.id), eq(cards.ownerUserId, userId)))
        .where(and(eq(installments.id, installmentId), isNotNull(installments.paidAt)))
        .limit(1)

      if (!existing) {
        return reply.status(404).send({ message: 'Parcela não encontrada ou já está pendente!' })
      }

      await db.update(installments).set({ paidAt: null }).where(eq(installments.id, installmentId))

      return reply.status(200).send({ message: 'Pagamento da parcela desfeito com sucesso!' })
    },
  )
}
