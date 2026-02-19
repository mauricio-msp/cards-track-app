import { and, eq } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db'
import { members } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'

export const getMember: FastifyPluginAsyncZod = async app => {
  app.get(
    '/api/members/:memberId',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Get member details by ID',
        tags: ['Members'],
        params: z.object({
          memberId: z.string(),
        }),
        response: {
          200: z.object({
            member: createSelectSchema(members).pick({ name: true, relationship: true }),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user
      const { memberId } = request.params

      const [member] = await db
        .select({
          name: members.name,
          relationship: members.relationship,
        })
        .from(members)
        .where(and(eq(members.id, memberId), eq(members.userId, userId)))

      if (!member) return reply.status(404).send({ message: 'Member not found' })

      return reply.send({ member })
    },
  )
}
