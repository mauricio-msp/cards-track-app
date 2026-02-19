import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '@/db'
import { cards } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'

export const getCard: FastifyPluginAsyncZod = async app => {
  app.get(
    '/api/cards/:cardId',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Get card details by ID',
        tags: ['Cards'],
        params: z.object({
          cardId: z.string(),
        }),
        response: {
          200: z.object({
            card: z.object({
              name: z.string(),
              limit: z.coerce.number(),
              closingOffsetDays: z.coerce.number(),
              dueDay: z.coerce.number(),
            }),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user
      const { cardId } = request.params

      const [card] = await db
        .select({
          name: cards.name,
          limit: cards.limit,
          dueDay: cards.dueDay,
          closingOffsetDays: cards.closingOffsetDays,
        })
        .from(cards)
        .where(and(eq(cards.id, cardId), eq(cards.ownerUserId, userId)))

      if (!card) return reply.status(404).send({ message: 'Card not found' })

      return reply.send({ card })
    },
  )
}
