import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { authMiddleware } from '@/middleware/auth'
import { anticipateDebtDto, createDebtDto, debtSchema } from '@/modules/debts/http/dto/debts.dto'
import type { AnticipateDebtController } from '@/modules/debts/http/controllers/anticipate-debt.controller'
import type { CreateDebtController } from '@/modules/debts/http/controllers/create-debt.controller'
import type { DeleteDebtMemberController } from '@/modules/debts/http/controllers/delete-debt-member.controller'
import type { DeleteDebtController } from '@/modules/debts/http/controllers/delete-debt.controller'
import type { GetDebtsTrendController } from '@/modules/debts/http/controllers/get-debts-trend.controller'
import type { GetDebtsYearsController } from '@/modules/debts/http/controllers/get-debts-years.controller'
import type { GetMonthHighestDebtsAmountController } from '@/modules/debts/http/controllers/get-month-highest-debts-amount.controller'
import type { GetMonthLowestDebtsAmountController } from '@/modules/debts/http/controllers/get-month-lowest-debts-amount.controller'
import type { GetMonthTotalDebtsAmountController } from '@/modules/debts/http/controllers/get-month-total-debts-amount.controller'
import type { GetTotalDebtsAmountController } from '@/modules/debts/http/controllers/get-total-debts-amount.controller'

type Controllers = {
  createDebt: CreateDebtController
  deleteDebt: DeleteDebtController
  deleteDebtMember: DeleteDebtMemberController
  anticipateDebt: AnticipateDebtController
  getDebtsTrend: GetDebtsTrendController
  getDebtsYears: GetDebtsYearsController
  getMonthHighestDebtsAmount: GetMonthHighestDebtsAmountController
  getMonthLowestDebtsAmount: GetMonthLowestDebtsAmountController
  getMonthTotalDebtsAmount: GetMonthTotalDebtsAmountController
  getTotalDebtsAmount: GetTotalDebtsAmountController
}

export const debtsRoutes =
  (controllers: Controllers): FastifyPluginAsyncZod =>
  async app => {
    app.post(
      '/api/debts',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Criar uma nova compra e gera as parcelas por membro',
          tags: ['Debts'],
          body: createDebtDto,
          response: {
            201: z.object({ debts: z.array(debtSchema), message: z.string() }),
            400: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) => controllers.createDebt.handle(req, reply),
    )

    app.delete(
      '/api/debts/:debtId',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Excluir compra inteira',
          description: 'Remove todos os débitos do mesmo groupId (todos os membros) e suas parcelas em cascata.',
          tags: ['Debts'],
          params: z.object({ debtId: z.uuid() }),
          response: {
            200: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) => controllers.deleteDebt.handle(req, reply),
    )

    app.delete(
      '/api/debts/:debtId/members/:memberId',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Excluir membro de uma compra compartilhada',
          description: 'Remove apenas o débito de um membro específico e suas parcelas em cascata.',
          tags: ['Debts'],
          params: z.object({ debtId: z.uuid(), memberId: z.uuid() }),
          response: {
            200: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) => controllers.deleteDebtMember.handle(req, reply),
    )

    app.patch(
      '/api/debts/:debtId/anticipate',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Antecipar parcelas de uma compra',
          description:
            'Consolida as parcelas futuras a partir de um número escolhido em um único installment na fatura atual em aberto.',
          tags: ['Debts'],
          params: z.object({ debtId: z.uuid() }),
          body: anticipateDebtDto,
          response: {
            200: z.object({
              message: z.string(),
              anticipatedAmount: z.number(),
              installmentsAnticipated: z.number(),
            }),
            400: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) => controllers.anticipateDebt.handle(req, reply),
    )

    app.get(
      '/api/debts/trend',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Obter evolução mensal de gastos por cartão',
          description: 'Retorna o histórico de gastos totais agrupados por mês e ano para cada cartão.',
          tags: ['Charts'],
          querystring: z.object({ year: z.coerce.number().int().optional() }),
          response: {
            200: z.object({ chartData: z.array(z.record(z.string(), z.union([z.string(), z.number()]))) }),
          },
        },
      },
      (req, reply) => controllers.getDebtsTrend.handle(req, reply),
    )

    app.get(
      '/api/debts/years',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Obter anos com faturas existentes',
          tags: ['Debts'],
          response: { 200: z.object({ years: z.array(z.number()) }) },
        },
      },
      (req, reply) => controllers.getDebtsYears.handle(req, reply),
    )

    app.get(
      '/api/month-highest-debts-amount',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Obter cartões com maior valor de fatura no mês atual',
          tags: ['Debts'],
          response: {
            200: z.object({
              amount: z.number(),
              cards: z.array(z.object({ cardId: z.string(), cardName: z.string(), total: z.number() })),
            }),
          },
        },
      },
      (req, reply) => controllers.getMonthHighestDebtsAmount.handle(req, reply),
    )

    app.get(
      '/api/month-lowest-debts-amount',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Obter cartões com menor valor de fatura no mês atual',
          tags: ['Debts'],
          response: {
            200: z.object({
              amount: z.number(),
              cards: z.array(z.object({ cardId: z.string(), cardName: z.string(), total: z.number() })),
            }),
          },
        },
      },
      (req, reply) => controllers.getMonthLowestDebtsAmount.handle(req, reply),
    )

    app.get(
      '/api/month-total-debts-amount',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Obter soma total das faturas pendentes no mês atual',
          tags: ['Debts'],
          response: { 200: z.object({ totalAmount: z.number() }) },
        },
      },
      (req, reply) => controllers.getMonthTotalDebtsAmount.handle(req, reply),
    )

    app.get(
      '/api/total-debts-amount',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Obter saldo devedor total de todos os cartões',
          tags: ['Debts'],
          response: { 200: z.object({ totalAmount: z.number() }) },
        },
      },
      (req, reply) => controllers.getTotalDebtsAmount.handle(req, reply),
    )
  }
