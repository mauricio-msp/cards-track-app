import { eq, sql } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db'
import { cards, invoices } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'

export const getDebtsYears: FastifyPluginAsyncZod = async app => {
  app.get(
    '/api/debts/years',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Obter anos com faturas existentes',
        description:
          'Retorna uma lista única de anos que possuem faturas registradas para os cartões do usuário, ordenada do mais recente para o mais antigo.',
        tags: ['Debts'],
        response: {
          200: z.object({
            years: z.array(z.number()),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user

      // Buscamos anos únicos na tabela de invoices,
      // filtrando apenas pelos cartões que pertencem ao usuário logado.
      const result = await db
        .select({
          year: invoices.year,
        })
        .from(invoices)
        .innerJoin(cards, eq(invoices.cardId, cards.id))
        .where(eq(cards.ownerUserId, userId))
        .groupBy(invoices.year)
        .orderBy(sql`${invoices.year} DESC`)

      const years = result.map(row => row.year)

      // Caso não existam faturas, retornamos o ano atual como padrão para evitar listas vazias no front-end
      if (years.length === 0) {
        return reply.status(200).send({ years: [new Date().getFullYear()] })
      }

      return reply.status(200).send({ years })
    },
  )
}
