import { and, eq, isNull } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db'
import { members } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'

export const updateMember: FastifyPluginAsyncZod = async app => {
  app.patch(
    '/api/members/:memberId',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Atualizar dados do membro',
        description:
          'Permite atualizar telefone e parentesco. O nome é imutável para preservar o histórico de despesas.',
        tags: ['Members'],
        params: z.object({ memberId: z.string() }),
        body: z.object({
          phone: z.string().nullable().optional(),
          relationship: z.string().optional(),
        }),
        response: {
          200: z.object({
            member: createSelectSchema(members),
            message: z.string(),
          }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user
      const { memberId } = request.params
      const { phone, relationship } = request.body

      const [member] = await db
        .select({ id: members.id })
        .from(members)
        .where(and(eq(members.id, memberId), eq(members.userId, userId), isNull(members.deletedAt)))

      if (!member) {
        return reply.status(404).send({ message: 'Membro não encontrado' })
      }

      const updates: Partial<typeof members.$inferInsert> = {}

      if (phone !== undefined) updates.phone = phone
      if (relationship !== undefined) updates.relationship = relationship

      const [updated] = await db
        .update(members)
        .set(updates)
        .where(eq(members.id, memberId))
        .returning()

      return reply.send({ member: updated, message: 'Membro atualizado com sucesso' })
    },
  )
}
