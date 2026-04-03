import { eq } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db'
import { members } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'

export const getMembers: FastifyPluginAsyncZod = async app => {
  app.get(
    '/api/members',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Lista todos os membros',
        description:
          'Retorna a lista completa de membros (familiares, amigos, etc.) cadastrados pelo usuário autenticado para divisão de despesas.',
        tags: ['Members'],
        response: {
          200: z.object({
            members: z.array(
              createSelectSchema(members).pick({
                id: true,
                name: true,
                relationship: true,
                createdAt: true,
              }),
            ),
          }),
          400: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user

      const rows = await db
        .select({
          id: members.id,
          name: members.name,
          relationship: members.relationship,
          createdAt: members.createdAt,
        })
        .from(members)
        .where(eq(members.userId, userId))

      return reply.status(200).send({ members: rows })
    },
  )
}
