import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '@/db'
import { subscriptions } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'

export const deleteSubscription: FastifyPluginAsyncZod = async app => {
  app.delete(
    '/api/subscriptions/:id',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Desativar assinatura recorrente',
        tags: ['Subscriptions'],
        params: z.object({ id: z.string() }),
        response: {
          200: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const userId = request.user.id

      const [sub] = await db
        .select({ id: subscriptions.id })
        .from(subscriptions)
        .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, userId)))

      if (!sub) return reply.status(404).send({ message: 'Assinatura não encontrada' })

      await db
        .update(subscriptions)
        .set({ active: false, deletedAt: new Date() })
        .where(eq(subscriptions.id, id))

      return reply.status(200).send({ message: 'Assinatura desativada com sucesso' })
    },
  )
}
