import { createSelectSchema } from 'drizzle-zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '@/db'
import { cards } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'

export const createCard: FastifyPluginAsyncZod = async app => {
  app.post(
    '/api/cards',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Create a new credit card for the authenticated user',
        tags: ['Cards'],
        body: z.object({
          name: z.string().min(3),
          limit: z.coerce.number().positive(),
          closingOffsetDays: z.coerce.number().positive(),
          dueDay: z.coerce.number().positive(),
        }),
        response: {
          201: z.object({
            card: createSelectSchema(cards),
            message: z.string(),
          }),
          400: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user
      const { name, limit, closingOffsetDays, dueDay } = request.body

      try {
        const [card] = await db
          .insert(cards)
          .values({
            name,
            limit,
            closingOffsetDays,
            dueDay,
            ownerUserId: userId,
          })
          .returning()

        return reply.status(201).send({
          card,
          message: 'Card created successfully!',
        })
      } catch (error) {
        request.log.error(error)

        return reply.status(400).send({
          message: 'Failed to create card',
        })
      }
    },
  )
}
