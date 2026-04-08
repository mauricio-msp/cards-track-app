import { and, eq, isNull } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db'
import { cards, installments, invoices } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'

export const deleteCard: FastifyPluginAsyncZod = async app => {
  app.delete(
    '/api/cards/:cardId',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Excluir um cartão',
        description:
          'Exclui um cartão somente se não houver parcelas pendentes (pagas ou não) em nenhuma fatura.',
        tags: ['Cards'],
        params: z.object({ cardId: z.string() }),
        response: {
          200: z.object({ message: z.string() }),
          400: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user
      const { cardId } = request.params

      const [card] = await db
        .select({ id: cards.id })
        .from(cards)
        .where(and(eq(cards.id, cardId), eq(cards.ownerUserId, userId)))

      if (!card) {
        return reply.status(404).send({ message: 'Cartão não encontrado' })
      }

      // Verificar se existem parcelas não pagas vinculadas ao cartão
      const [unpaidCheck] = await db
        .select({ id: installments.id })
        .from(installments)
        .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
        .where(and(eq(invoices.cardId, cardId), isNull(installments.paidAt)))
        .limit(1)

      if (unpaidCheck) {
        return reply.status(400).send({
          message: 'Não é possível excluir um cartão com despesas ativas. Quite todas as parcelas antes de excluir.',
        })
      }

      await db.delete(cards).where(eq(cards.id, cardId))

      return reply.send({ message: 'Cartão excluído com sucesso' })
    },
  )
}
