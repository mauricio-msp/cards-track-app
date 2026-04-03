import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db'
import { cards, debts } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'

export const deleteDebt: FastifyPluginAsyncZod = async app => {
  app.delete(
    '/api/debts/:debtId',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Excluir compra inteira',
        description:
          'Remove todos os débitos do mesmo groupId (todos os membros) e suas parcelas em cascata. Use para cancelamento ou estorno total da compra.',
        tags: ['Debts'],
        params: z.object({
          debtId: z.string(),
        }),
        response: {
          200: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user
      const { debtId } = request.params

      const [target] = await db
        .select({ groupId: debts.groupId })
        .from(debts)
        .innerJoin(cards, and(eq(debts.cardId, cards.id), eq(cards.ownerUserId, userId)))
        .where(eq(debts.id, debtId))
        .limit(1)

      if (!target) {
        return reply.status(404).send({ message: 'Despesa não encontrada!' })
      }

      await db.delete(debts).where(eq(debts.groupId, target.groupId))

      return reply.status(200).send({ message: 'Despesa excluída com sucesso!' })
    },
  )
}
