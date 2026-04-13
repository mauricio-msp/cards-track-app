import { createSelectSchema } from 'drizzle-zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { debts } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'
import { anticipateDebtDto, createDebtDto } from '@/modules/debts/debts.dto'
import {
  DebtAlreadyAnticipatedError,
  DebtNotFoundError,
  DebtSharedBetweenMembersError,
  InvalidAnticipateInstallmentError,
  NoUnpaidInstallmentsError,
} from '@/modules/debts/debts.errors'
import type { DebtsService } from '@/modules/debts/debts.service'

export const debtsController =
  (service: DebtsService): FastifyPluginAsyncZod =>
  async app => {
    // POST /api/debts
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
      async (request, reply) => {
        try {
          const createdDebts = await service.create(request.user.id, request.body)
          return reply.status(201).send({
            debts: createdDebts,
            message: 'Despesas e parcelas registradas com sucesso!',
          })
        } catch (err) {
          request.log.error(err)
          return reply.status(400).send({
            message: err instanceof Error ? err.message : 'Erro ao registrar despesa(s)',
          })
        }
      },
    )

    // DELETE /api/debts/:debtId
    app.delete(
      '/api/debts/:debtId',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Excluir compra inteira',
          description:
            'Remove todos os débitos do mesmo groupId (todos os membros) e suas parcelas em cascata.',
          tags: ['Debts'],
          params: z.object({ debtId: z.string() }),
          response: {
            200: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      async (request, reply) => {
        try {
          await service.deleteDebt(request.params.debtId, request.user.id)
          return reply.status(200).send({ message: 'Despesa excluída com sucesso!' })
        } catch (err) {
          if (err instanceof DebtNotFoundError) {
            return reply.status(404).send({ message: err.message })
          }

          request.log.error(err)
          return reply.status(500).send({ message: 'Falha ao excluir despesa' })
        }
      },
    )

    // DELETE /api/debts/:debtId/members/:memberId
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
      async (request, reply) => {
        try {
          await service.deleteDebtMember(
            request.params.debtId,
            request.params.memberId,
            request.user.id,
          )
          return reply.status(200).send({ message: 'Membro removido da despesa com sucesso!' })
        } catch (err) {
          if (err instanceof DebtNotFoundError) {
            return reply.status(404).send({ message: err.message })
          }

          request.log.error(err)
          return reply.status(500).send({ message: 'Falha ao remover membro da despesa' })
        }
      },
    )

    // PATCH /api/debts/:debtId/anticipate
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
      async (request, reply) => {
        try {
          const result = await service.anticipate(
            request.params.debtId,
            request.user.id,
            request.body,
          )
          return reply.status(200).send({
            message: 'Installments anticipated successfully',
            ...result,
          })
        } catch (err) {
          if (err instanceof DebtNotFoundError) {
            return reply.status(404).send({ message: err.message })
          }
          if (
            err instanceof DebtAlreadyAnticipatedError ||
            err instanceof DebtSharedBetweenMembersError ||
            err instanceof NoUnpaidInstallmentsError ||
            err instanceof InvalidAnticipateInstallmentError
          ) {
            return reply.status(400).send({ message: err.message })
          }

          request.log.error(err)
          return reply.status(500).send({ message: 'Falha ao antecipar parcelas' })
        }
      },
    )

    // GET /api/debts/trend
    app.get(
      '/api/debts/trend',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Obter evolução mensal de gastos por cartão',
          description:
            'Retorna o histórico de gastos totais agrupados por mês e ano para cada cartão.',
          tags: ['Charts'],
          querystring: z.object({ year: z.coerce.number().int().optional() }),
          response: {
            200: z.object({
              chartData: z.array(z.record(z.string(), z.union([z.string(), z.number()]))),
            }),
          },
        },
      },
      async (request, reply) => {
        const year = request.query.year ?? new Date().getFullYear()
        const chartData = await service.getDebtsTrend(request.user.id, year)
        return reply.status(200).send({ chartData })
      },
    )

    // GET /api/debts/years
    app.get(
      '/api/debts/years',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Obter anos com faturas existentes',
          description:
            'Retorna uma lista única de anos que possuem faturas registradas para os cartões do usuário.',
          tags: ['Debts'],
          response: { 200: z.object({ years: z.array(z.number()) }) },
        },
      },
      async (request, reply) => {
        const years = await service.getDebtsYears(request.user.id)
        return reply.status(200).send({ years })
      },
    )

    // GET /api/month-highest-debts-amount
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
              cards: z.array(
                z.object({ cardId: z.string(), cardName: z.string(), total: z.number() }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const now = new Date()
        const result = await service.getMonthHighestDebtsAmount(
          request.user.id,
          now.getMonth(),
          now.getFullYear(),
        )
        return reply.status(200).send(result)
      },
    )

    // GET /api/month-lowest-debts-amount
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
              cards: z.array(
                z.object({ cardId: z.string(), cardName: z.string(), total: z.number() }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const now = new Date()
        const result = await service.getMonthLowestDebtsAmount(
          request.user.id,
          now.getMonth(),
          now.getFullYear(),
        )
        return reply.status(200).send(result)
      },
    )

    // GET /api/month-total-debts-amount
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
      async (request, reply) => {
        const totalAmount = await service.getMonthTotalDebtsAmount(request.user.id)
        return reply.status(200).send({ totalAmount })
      },
    )

    // GET /api/total-debts-amount
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
      async (request, reply) => {
        const totalAmount = await service.getTotalDebtsAmount(request.user.id)
        return reply.status(200).send({ totalAmount })
      },
    )
  }
