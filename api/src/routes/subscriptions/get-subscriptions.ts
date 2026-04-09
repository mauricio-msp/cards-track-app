import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '@/db'
import { cards, members, subscriptions } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'

export const getSubscriptions: FastifyPluginAsyncZod = async app => {
  app.get(
    '/api/subscriptions',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Listar assinaturas do usuário',
        tags: ['Subscriptions'],
        response: {
          200: z.object({
            subscriptions: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                amount: z.number(),
                billingDay: z.number(),
                active: z.boolean(),
                cardId: z.string(),
                cardName: z.string(),
                memberId: z.string(),
                memberName: z.string(),
                createdAt: z.string(),
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const userId = request.user.id

      const rows = await db
        .select({
          id: subscriptions.id,
          name: subscriptions.name,
          amount: subscriptions.amount,
          billingDay: subscriptions.billingDay,
          active: subscriptions.active,
          cardId: subscriptions.cardId,
          cardName: cards.name,
          memberId: subscriptions.memberId,
          memberName: members.name,
          createdAt: subscriptions.createdAt,
        })
        .from(subscriptions)
        .innerJoin(cards, eq(subscriptions.cardId, cards.id))
        .innerJoin(members, eq(subscriptions.memberId, members.id))
        .where(eq(subscriptions.userId, userId))
        .orderBy(subscriptions.createdAt)

      return reply.status(200).send({
        subscriptions: rows.map(r => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        })),
      })
    },
  )
}
