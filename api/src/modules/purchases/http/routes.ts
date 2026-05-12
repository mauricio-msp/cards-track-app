import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { authMiddleware } from '@/middleware/auth'
import { anticipatePurchaseDto, createPurchaseDto } from '@/modules/purchases/http/dto/purchases.dto'
import type { AnticipatePurchaseController } from '@/modules/purchases/http/controllers/anticipate-purchase.controller'
import type { CreatePurchaseController } from '@/modules/purchases/http/controllers/create-purchase.controller'
import type { DeletePurchaseController } from '@/modules/purchases/http/controllers/delete-purchase.controller'
import type { DeletePurchaseMemberController } from '@/modules/purchases/http/controllers/delete-purchase-member.controller'
import type { GetMonthHighestAmountController } from '@/modules/purchases/http/controllers/get-month-highest-amount.controller'
import type { GetMonthLowestAmountController } from '@/modules/purchases/http/controllers/get-month-lowest-amount.controller'
import type { GetMonthTotalAmountController } from '@/modules/purchases/http/controllers/get-month-total-amount.controller'
import type { GetPurchasesTrendController } from '@/modules/purchases/http/controllers/get-purchases-trend.controller'
import type { GetPurchasesYearsController } from '@/modules/purchases/http/controllers/get-purchases-years.controller'
import type { GetTotalAmountController } from '@/modules/purchases/http/controllers/get-total-amount.controller'

type Controllers = {
  createPurchase: CreatePurchaseController
  deletePurchase: DeletePurchaseController
  deletePurchaseMember: DeletePurchaseMemberController
  anticipatePurchase: AnticipatePurchaseController
  getPurchasesTrend: GetPurchasesTrendController
  getPurchasesYears: GetPurchasesYearsController
  getMonthHighestAmount: GetMonthHighestAmountController
  getMonthLowestAmount: GetMonthLowestAmountController
  getMonthTotalAmount: GetMonthTotalAmountController
  getTotalAmount: GetTotalAmountController
}

const pmIdParam = z.object({ pmId: z.string().uuid() })
const cardAmountRow = z.object({ cardId: z.string(), cardName: z.string(), total: z.number() })

export const purchasesRoutes =
  (controllers: Controllers): FastifyPluginAsyncZod =>
  async app => {
    app.post(
      '/api/purchases',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Registrar nova compra com parcelas por membro',
          tags: ['Purchases'],
          body: createPurchaseDto,
          response: {
            201: z.object({ purchase: z.any(), message: z.string() }),
            400: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) => controllers.createPurchase.handle(req as any, reply),
    )

    app.delete(
      '/api/purchases/:pmId',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Excluir compra inteira (todos os membros)',
          tags: ['Purchases'],
          params: pmIdParam,
          response: {
            200: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) => controllers.deletePurchase.handle(req as any, reply),
    )

    app.delete(
      '/api/purchases/:pmId/members/:memberId',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Remover membro específico de uma compra compartilhada',
          tags: ['Purchases'],
          params: z.object({ pmId: z.string().uuid(), memberId: z.string().uuid() }),
          response: {
            200: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) => controllers.deletePurchaseMember.handle(req as any, reply),
    )

    app.patch(
      '/api/purchases/:pmId/anticipate',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Antecipar parcelas futuras para a fatura atual',
          tags: ['Purchases'],
          params: pmIdParam,
          body: anticipatePurchaseDto,
          response: {
            200: z.object({ message: z.string(), anticipatedAmount: z.number(), installmentsAnticipated: z.number() }),
            400: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) => controllers.anticipatePurchase.handle(req as any, reply),
    )

    app.get(
      '/api/purchases/trend',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Evolução mensal de gastos por cartão',
          tags: ['Purchases'],
          querystring: z.object({ year: z.coerce.number().int().optional() }),
          response: {
            200: z.object({ chartData: z.array(z.record(z.string(), z.union([z.string(), z.number()]))) }),
          },
        },
      },
      (req, reply) => controllers.getPurchasesTrend.handle(req as any, reply),
    )

    app.get(
      '/api/purchases/years',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Anos com compras registradas',
          tags: ['Purchases'],
          response: { 200: z.object({ years: z.array(z.number()) }) },
        },
      },
      (req, reply) => controllers.getPurchasesYears.handle(req as any, reply),
    )

    app.get(
      '/api/purchases/month-highest-amount',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Cartão com maior fatura no mês atual',
          tags: ['Purchases'],
          response: { 200: z.object({ amount: z.number(), cards: z.array(cardAmountRow) }) },
        },
      },
      (req, reply) => controllers.getMonthHighestAmount.handle(req as any, reply),
    )

    app.get(
      '/api/purchases/month-lowest-amount',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Cartão com menor fatura no mês atual',
          tags: ['Purchases'],
          response: { 200: z.object({ amount: z.number(), cards: z.array(cardAmountRow) }) },
        },
      },
      (req, reply) => controllers.getMonthLowestAmount.handle(req as any, reply),
    )

    app.get(
      '/api/purchases/month-total-amount',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Total de faturas pendentes no mês atual',
          tags: ['Purchases'],
          response: { 200: z.object({ totalAmount: z.number() }) },
        },
      },
      (req, reply) => controllers.getMonthTotalAmount.handle(req as any, reply),
    )

    app.get(
      '/api/purchases/total-amount',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Saldo devedor total em todos os cartões',
          tags: ['Purchases'],
          response: { 200: z.object({ totalAmount: z.number() }) },
        },
      },
      (req, reply) => controllers.getTotalAmount.handle(req as any, reply),
    )
  }
