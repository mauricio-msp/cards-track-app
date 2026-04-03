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
        summary: 'Criar um novo cartão de crédito',
        description: 'Cadastra um cartão definindo limite, dia de fechamento e dia de vencimento.',
        tags: ['Cards'],
        body: z.object({
          name: z.string().min(3),
          limit: z.coerce.number().positive().describe('Limite total do cartão em centavos'),
          closingOffsetDays: z.coerce
            .number()
            .positive()
            .describe('Número de dias anteriores ao fechamento da fatura'),
          dueDay: z.coerce.number().positive().describe('Dia do fechamento da fatura'),
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
          message: 'Cartão criado com sucesso!',
        })
      } catch (error) {
        request.log.error(error)

        return reply.status(400).send({
          message: 'Falha ao criar cartão. Verifique os dados e tente novamente.',
        })
      }
    },
  )
}
