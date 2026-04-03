import { and, eq, sql } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db'
import { cards, installments, invoices } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'

type DebtChartDataEntry = {
  date: string
  [cardName: string]: number | string
}

export const getDebtsTrend: FastifyPluginAsyncZod = async app => {
  app.get(
    '/api/debts/trend',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Obter evolução mensal de gastos por cartão',
        description:
          'Retorna o histórico de gastos totais agrupados por mês e ano para um cartão específico, permitindo visualizar a tendência de consumo e o uso do limite ao longo do tempo.',
        tags: ['Charts'],
        querystring: z.object({
          year: z.coerce.number().int().optional(),
        }),
        response: {
          200: z.object({
            chartData: z.array(z.record(z.string(), z.union([z.string(), z.number()]))),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user
      const targetYear = request.query.year ?? new Date().getFullYear()

      /*
       * Busca os totais agrupados por cartão e mês diretamente no banco.
       * Os installments já estão materializados — inclusive com antecipações —
       * então o dado é sempre correto sem recálculo em JS.
       */
      const rows = await db
        .select({
          cardName: cards.name,
          month: invoices.month,
          total: sql<number>`COALESCE(SUM(${installments.amount}), 0)`.mapWith(Number),
        })
        .from(installments)
        .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
        .innerJoin(cards, eq(invoices.cardId, cards.id))
        .where(and(eq(cards.ownerUserId, userId), eq(invoices.year, targetYear)))
        .groupBy(cards.name, invoices.month)
        .orderBy(invoices.month)

      // Nomes únicos de cartões para inicializar os 12 meses com zero
      const uniqueCardNames = [...new Set(rows.map(r => r.cardName.toLowerCase()))]

      // Monta a estrutura dos 12 meses zerada
      const monthMap = new Map<number, DebtChartDataEntry>()

      for (let i = 0; i < 12; i++) {
        const entry: DebtChartDataEntry = {
          date: `${targetYear}-${String(i + 1).padStart(2, '0')}`,
        }
        for (const name of uniqueCardNames) {
          entry[name] = 0
        }
        monthMap.set(i, entry)
      }

      // Preenche com os totais vindos do banco — zero cálculo numérico aqui
      for (const row of rows) {
        const entry = monthMap.get(row.month)
        if (!entry) continue
        entry[row.cardName.toLowerCase()] = row.total
      }

      return reply.status(200).send({
        chartData: Array.from(monthMap.values()),
      })
    },
  )
}
