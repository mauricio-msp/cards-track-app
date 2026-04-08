import { and, eq, isNull } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db'
import { members } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'

export const deleteMember: FastifyPluginAsyncZod = async app => {
  app.delete(
    '/api/members/:memberId',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Excluir um membro',
        description:
          'Faz exclusão lógica do membro. Suas despesas permanecem ativas e associadas ao histórico.',
        tags: ['Members'],
        params: z.object({ memberId: z.string() }),
        response: {
          200: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user
      const { memberId } = request.params

      const [member] = await db
        .select({ id: members.id })
        .from(members)
        .where(and(eq(members.id, memberId), eq(members.userId, userId), isNull(members.deletedAt)))

      if (!member) {
        return reply.status(404).send({ message: 'Membro não encontrado' })
      }

      await db.update(members).set({ deletedAt: new Date() }).where(eq(members.id, memberId))

      return reply.status(200).send({
        message: 'Membro excluído com sucesso. Histórico de despesas preservado.',
      })
    },
  )
}
