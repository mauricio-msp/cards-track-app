import { and, eq, sql } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '@/db'
import { members } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'

export const createMember: FastifyPluginAsyncZod = async app => {
  app.post(
    '/api/members',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Cria um novo membro',
        tags: ['Members'],
        body: z.object({
          name: z.string().min(3),
          relationship: z.string(),
        }),
        response: {
          201: z.object({
            member: createSelectSchema(members).nullable(),
            message: z.string(),
          }),
          409: z.object({
            message: z.string(),
          }),
          500: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user
      const { name, relationship } = request.body

      try {
        const normalizedName = name.trim()

        const [memberExisting] = await db
          .select({ id: members.id })
          .from(members)
          .where(
            and(eq(members.userId, userId), sql`lower(${members.name}) = lower(${normalizedName})`),
          )
          .limit(1)

        if (memberExisting) {
          return reply.status(409).send({
            message: 'Membro já existe para este usuário',
          })
        }

        const [member] = await db
          .insert(members)
          .values({
            userId,
            name: normalizedName,
            relationship,
          })
          .returning()

        return reply.status(201).send({
          member,
          message: 'Membro criado com sucesso!',
        })
      } catch (error) {
        request.log.error(error)

        return reply.status(500).send({
          message: 'Falha ao criar o membro',
        })
      }
    },
  )
}
