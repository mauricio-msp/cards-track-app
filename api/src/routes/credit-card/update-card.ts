import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db'
import { cards } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'

export const updateCard: FastifyPluginAsyncZod = async app => {
  app.patch(
    '/api/cards/:id',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Atualizar um cartão',
        tags: ['Cards'],
        params: z.object({ id: z.string() }),
        body: z.object({
          limit: z.number().int().positive(),
          closingOffsetDays: z.number().int().min(1).max(31),
          dueDay: z.number().int().min(1).max(31),
        }),
        response: {
          200: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user
      const { id } = request.params
      const { limit, closingOffsetDays, dueDay } = request.body

      const [card] = await db
        .select({ id: cards.id })
        .from(cards)
        .where(and(eq(cards.id, id), eq(cards.ownerUserId, userId)))

      if (!card) {
        return reply.status(404).send({ message: 'Cartão não encontrado' })
      }

      await db.update(cards).set({ limit, closingOffsetDays, dueDay }).where(eq(cards.id, id))

      return reply.send({ message: 'Cartão atualizado com sucesso' })
    },
  )
}
