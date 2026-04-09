import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '@/db'
import { cards, subscriptions } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'

export const updateSubscription: FastifyPluginAsyncZod = async app => {
  app.patch(
    '/api/subscriptions/:id',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Atualizar assinatura recorrente',
        tags: ['Subscriptions'],
        params: z.object({ id: z.string() }),
        body: z.object({
          name: z.string().min(1).optional(),
          amount: z.coerce.number().int().positive().optional(),
          billingDay: z.coerce.number().int().min(1).max(31).optional(),
          cardId: z.string().optional(),
          active: z.boolean().optional(),
        }),
        response: {
          200: z.object({ message: z.string() }),
          400: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const userId = request.user.id
      const updates = request.body

      const [sub] = await db
        .select({ id: subscriptions.id })
        .from(subscriptions)
        .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, userId)))

      if (!sub) return reply.status(404).send({ message: 'Assinatura não encontrada' })

      if (updates.cardId) {
        const [card] = await db
          .select({ id: cards.id })
          .from(cards)
          .where(and(eq(cards.id, updates.cardId), eq(cards.ownerUserId, userId)))

        if (!card) return reply.status(400).send({ message: 'Cartão não encontrado' })
      }

      await db.update(subscriptions).set(updates).where(eq(subscriptions.id, id))

      return reply.status(200).send({ message: 'Assinatura atualizada com sucesso' })
    },
  )
}
