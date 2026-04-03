import { eq } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '@/db'
import { cards } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'

export const getCards: FastifyPluginAsyncZod = async app => {
  app.get(
    '/api/cards',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Listar todos os cartões de crédito do usuário',
        description:
          'Retorna uma lista de todos os cartões cadastrados pelo usuário autenticado, incluindo informações de limite e datas de faturamento.',
        tags: ['Cards'],
        response: {
          200: z.object({
            cards: z.array(createSelectSchema(cards).pick({ id: true, name: true, limit: true })),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user

      const rows = await db
        .select({ id: cards.id, name: cards.name, limit: cards.limit })
        .from(cards)
        .where(eq(cards.ownerUserId, userId))

      return reply.status(200).send({ cards: rows })
    },
  )
}
