import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db'
import { cards, debts } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'

export const deleteDebtMember: FastifyPluginAsyncZod = async app => {
  app.delete(
    '/api/debts/:debtId/members/:memberId',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Excluir membro de uma compra compartilhada',
        description:
          'Remove apenas o débito de um membro específico e suas parcelas em cascata. Os demais membros do grupo permanecem intactos.',
        tags: ['Debts'],
        params: z.object({
          debtId: z.string(),
          memberId: z.string(),
        }),
        response: {
          200: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user
      const { debtId, memberId } = request.params

      const [target] = await db
        .select({ id: debts.id })
        .from(debts)
        .innerJoin(cards, and(eq(debts.cardId, cards.id), eq(cards.ownerUserId, userId)))
        .where(and(eq(debts.id, debtId), eq(debts.memberId, memberId)))
        .limit(1)

      if (!target) {
        return reply.status(404).send({ message: 'Despesa não encontrada!' })
      }

      await db.delete(debts).where(eq(debts.id, target.id))

      return reply.status(200).send({ message: 'Membro removido da despesa com sucesso!' })
    },
  )
}
