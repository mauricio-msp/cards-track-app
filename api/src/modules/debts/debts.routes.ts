import { createSelectSchema } from 'drizzle-zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { debts } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'
import { anticipateDebtDto, createDebtDto } from '@/modules/debts/debts.dto'
import type { AnticipateDebtController } from './use-cases/anticipate-debt/anticipate-debt.controller'
import type { CreateDebtController } from './use-cases/create-debt/create-debt.controller'
import type { DeleteDebtMemberController } from './use-cases/delete-debt-member/delete-debt-member.controller'
import type { DeleteDebtController } from './use-cases/delete-debt/delete-debt.controller'
import type { GetDebtsTrendController } from './use-cases/get-debts-trend/get-debts-trend.controller'
import type { GetDebtsYearsController } from './use-cases/get-debts-years/get-debts-years.controller'
import type { GetMonthHighestDebtsAmountController } from './use-cases/get-month-highest-debts-amount/get-month-highest-debts-amount.controller'
import type { GetMonthLowestDebtsAmountController } from './use-cases/get-month-lowest-debts-amount/get-month-lowest-debts-amount.controller'
import type { GetMonthTotalDebtsAmountController } from './use-cases/get-month-total-debts-amount/get-month-total-debts-amount.controller'
import type { GetTotalDebtsAmountController } from './use-cases/get-total-debts-amount/get-total-debts-amount.controller'

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
            201: z.object({ debts: z.array(createSelectSchema(debts)), message: z.string() }),
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
          params: z.object({ debtId: z.string() }),
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
          params: z.object({ debtId: z.string(), memberId: z.string() }),
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
          params: z.object({ debtId: z.string() }),
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
