import { and, eq, isNull } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '@/db'
import { cards, members, subscriptions } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'

export const createSubscription: FastifyPluginAsyncZod = async app => {
  app.post(
    '/api/subscriptions',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Criar uma assinatura recorrente',
        tags: ['Subscriptions'],
        body: z.object({
          cardId: z.string(),
          memberId: z.string(),
          name: z.string().min(1),
          amount: z.coerce.number().int().positive().describe('Valor em centavos'),
          billingDay: z.coerce.number().int().min(1).max(31),
        }),
        response: {
          201: z.object({
            subscription: z.object({
              id: z.string(),
              name: z.string(),
              amount: z.number(),
              billingDay: z.number(),
              cardId: z.string(),
              memberId: z.string(),
              active: z.boolean(),
              createdAt: z.string(),
            }),
          }),
          400: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { cardId, memberId, name, amount, billingDay } = request.body
      const userId = request.user.id

      const [card] = await db
        .select({ id: cards.id })
        .from(cards)
        .where(and(eq(cards.id, cardId), eq(cards.ownerUserId, userId)))

      if (!card) {
        return reply.status(400).send({ message: 'Cartão não encontrado ou não pertence ao usuário' })
      }

      const [member] = await db
        .select({ id: members.id })
        .from(members)
        .where(and(eq(members.id, memberId), isNull(members.deletedAt)))

      if (!member) {
        return reply.status(400).send({ message: 'Membro não encontrado ou excluído' })
      }

      const [created] = await db
        .insert(subscriptions)
        .values({ userId, cardId, memberId, name, amount, billingDay })
        .returning()

      return reply.status(201).send({
        subscription: {
          ...created,
          createdAt: created.createdAt.toISOString(),
        },
      })
    },
  )
}
