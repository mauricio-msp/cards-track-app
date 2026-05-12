import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { authMiddleware } from '@/middleware/auth'
import type { GetMonthHighestAmountController } from '@/modules/metrics/http/controllers/get-month-highest-amount.controller'
import type { GetMonthLowestAmountController } from '@/modules/metrics/http/controllers/get-month-lowest-amount.controller'
import type { GetMonthTotalAmountController } from '@/modules/metrics/http/controllers/get-month-total-amount.controller'
import type { GetTotalAmountController } from '@/modules/metrics/http/controllers/get-total-amount.controller'
import type { GetTrendController } from '@/modules/metrics/http/controllers/get-trend.controller'
import type { GetYearsController } from '@/modules/metrics/http/controllers/get-years.controller'

type Controllers = {
  getTrend: GetTrendController
  getYears: GetYearsController
  getMonthHighestAmount: GetMonthHighestAmountController
  getMonthLowestAmount: GetMonthLowestAmountController
  getMonthTotalAmount: GetMonthTotalAmountController
  getTotalAmount: GetTotalAmountController
}

const cardAmountRow = z.object({ cardId: z.string(), cardName: z.string(), total: z.number() })

export const metricsRoutes =
  (controllers: Controllers): FastifyPluginAsyncZod =>
  async app => {
    app.get(
      '/api/metrics/trend',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Evolução mensal de gastos por cartão',
          tags: ['Metrics'],
          querystring: z.object({ year: z.coerce.number().int().optional() }),
          response: {
            200: z.object({
              chartData: z.array(z.record(z.string(), z.union([z.string(), z.number()]))),
            }),
          },
        },
      },
      (req, reply) => {
        const year = req.query.year ?? new Date().getFullYear()
        return controllers.getTrend.handle(req.user.id, year, reply, req.log)
      },
    )

    app.get(
      '/api/metrics/years',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Anos com registros de despesas',
          tags: ['Metrics'],
          response: { 200: z.object({ years: z.array(z.number()) }) },
        },
      },
      (req, reply) => controllers.getYears.handle(req.user.id, reply, req.log),
    )

    app.get(
      '/api/metrics/month-highest-amount',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Cartão com maior fatura no mês atual',
          tags: ['Metrics'],
          response: { 200: z.object({ amount: z.number(), cards: z.array(cardAmountRow) }) },
        },
      },
      (req, reply) => controllers.getMonthHighestAmount.handle(req.user.id, reply, req.log),
    )

    app.get(
      '/api/metrics/month-lowest-amount',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Cartão com menor fatura no mês atual',
          tags: ['Metrics'],
          response: { 200: z.object({ amount: z.number(), cards: z.array(cardAmountRow) }) },
        },
      },
      (req, reply) => controllers.getMonthLowestAmount.handle(req.user.id, reply, req.log),
    )

    app.get(
      '/api/metrics/month-total-amount',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Total de faturas pendentes no mês atual',
          tags: ['Metrics'],
          response: { 200: z.object({ totalAmount: z.number() }) },
        },
      },
      (req, reply) => controllers.getMonthTotalAmount.handle(req.user.id, reply, req.log),
    )

    app.get(
      '/api/metrics/total-amount',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Saldo devedor total em todos os cartões',
          tags: ['Metrics'],
          response: { 200: z.object({ totalAmount: z.number() }) },
        },
      },
      (req, reply) => controllers.getTotalAmount.handle(req.user.id, reply, req.log),
    )
  }
