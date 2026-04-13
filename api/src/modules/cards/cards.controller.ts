import { createSelectSchema } from 'drizzle-zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { cards } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'
import {
  cardSchema,
  createCardDto,
  getCardDebtsQueryDto,
  updateCardDto,
} from '@/modules/cards/cards.dto'
import { CardHasActiveDebtsError, CardNotFoundError } from '@/modules/cards/cards.errors'
import type { CardsService } from '@/modules/cards/cards.service'

export const cardsController =
  (service: CardsService): FastifyPluginAsyncZod =>
  async app => {
    // POST /api/cards
    app.post(
      '/api/cards',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Criar um novo cartão de crédito',
          description:
            'Cadastra um cartão definindo limite, dia de fechamento e dia de vencimento.',
          tags: ['Cards'],
          body: createCardDto,
          response: {
            201: z.object({ card: cardSchema, message: z.string() }),
            400: z.object({ message: z.string() }),
          },
        },
      },
      async (request, reply) => {
        try {
          const card = await service.create(request.user.id, request.body)
          return reply.status(201).send({ card, message: 'Cartão criado com sucesso!' })
        } catch (err) {
          request.log.error(err)
          return reply
            .status(400)
            .send({ message: 'Falha ao criar cartão. Verifique os dados e tente novamente.' })
        }
      },
    )

    // GET /api/cards
    app.get(
      '/api/cards',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Listar todos os cartões de crédito do usuário',
          description:
            'Retorna uma lista de todos os cartões cadastrados pelo usuário autenticado, incluindo informações de limite e datas de faturamento.',
          tags: ['Cards'],
          response: {
            200: z.object({
              cards: z.array(
                createSelectSchema(cards).omit({ createdAt: true, ownerUserId: true }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const rows = await service.findAll(request.user.id)
        return reply.status(200).send({ cards: rows })
      },
    )

    // GET /api/cards/:cardId
    app.get(
      '/api/cards/:cardId',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Obter detalhes do cartão pelo ID',
          description:
            'Retorna as informações completas de um cartão de crédito específico pertencente ao usuário autenticado.',
          tags: ['Cards'],
          params: z.object({ cardId: z.string() }),
          response: {
            200: z.object({
              card: z.object({
                name: z.string(),
                limit: z.coerce.number(),
                dueDay: z.coerce.number(),
                closingOffsetDays: z.coerce.number(),
              }),
            }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      async (request, reply) => {
        try {
          const card = await service.findById(request.params.cardId, request.user.id)
          return reply.send({
            card: {
              name: card.name,
              limit: card.limit,
              dueDay: card.dueDay,
              closingOffsetDays: card.closingOffsetDays,
            },
          })
        } catch (err) {
          if (err instanceof CardNotFoundError) {
            return reply.status(404).send({ message: err.message })
          }

          request.log.error(err)
          return reply.status(500).send({ message: 'Falha ao buscar o cartão' })
        }
      },
    )

    // PATCH /api/cards/:id
    app.patch(
      '/api/cards/:id',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Atualizar um cartão',
          tags: ['Cards'],
          params: z.object({ id: z.string() }),
          body: updateCardDto,
          response: {
            200: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      async (request, reply) => {
        try {
          await service.update(request.params.id, request.user.id, request.body)
          return reply.send({ message: 'Cartão atualizado com sucesso' })
        } catch (err) {
          if (err instanceof CardNotFoundError) {
            return reply.status(404).send({ message: err.message })
          }

          request.log.error(err)
          return reply.status(500).send({ message: 'Falha ao atualizar o cartão' })
        }
      },
    )

    // DELETE /api/cards/:cardId
    app.delete(
      '/api/cards/:cardId',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Excluir um cartão',
          description:
            'Exclui um cartão somente se não houver parcelas pendentes (pagas ou não) em nenhuma fatura.',
          tags: ['Cards'],
          params: z.object({ cardId: z.string() }),
          response: {
            200: z.object({ message: z.string() }),
            400: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      async (request, reply) => {
        try {
          await service.delete(request.params.cardId, request.user.id)
          return reply.send({ message: 'Cartão excluído com sucesso' })
        } catch (err) {
          if (err instanceof CardNotFoundError) {
            return reply.status(404).send({ message: err.message })
          }

          if (err instanceof CardHasActiveDebtsError) {
            return reply.status(400).send({ message: err.message })
          }

          request.log.error(err)
          return reply.status(500).send({ message: 'Falha ao excluir o cartão' })
        }
      },
    )

    // GET /api/cards/:cardId/debts
    app.get(
      '/api/cards/:cardId/debts',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Obter resumo de despesas do cartão por mês',
          description:
            'Lista todas as despesas vinculadas a um cartão em um mês específico, agrupando os membros responsáveis e detalhando o progresso das parcelas.',
          tags: ['Cards'],
          params: z.object({ cardId: z.string() }),
          querystring: getCardDebtsQueryDto,
          response: {
            200: z.object({
              debts: z.array(
                z.object({
                  debtId: z.string(),
                  groupId: z.string(),
                  description: z.string(),
                  purchaseDate: z.string(),
                  category: z.string().nullable(),
                  totalAmount: z.number(),
                  installmentsCount: z.number(),
                  elapsedInstallments: z.number(),
                  remainingInstallments: z.number(),
                  anticipatedAt: z.string().nullable(),
                  anticipatedInstallmentsCount: z.number().nullable(),
                  anticipateFromInstallment: z.number().nullable(),
                  subscriptionId: z.string().nullable(),
                  members: z.array(
                    z.object({
                      id: z.string(),
                      name: z.string(),
                      relationship: z.string(),
                      installmentAmount: z.number(),
                    }),
                  ),
                }),
              ),
            }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      async (request, reply) => {
        try {
          const { cardId } = request.params
          const { month, year } = request.query

          const cardDebts = await service.getCardDebts(cardId, request.user.id, month, year)
          return reply.send({ debts: cardDebts })
        } catch (err) {
          if (err instanceof CardNotFoundError) {
            return reply.status(404).send({ message: err.message })
          }

          request.log.error(err)
          return reply.status(500).send({ message: 'Falha ao buscar despesas do cartão' })
        }
      },
    )

    // GET /api/cards/:cardId/total-amount-used
    app.get(
      '/api/cards/:cardId/total-amount-used',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Obter saldo total usado (parcelas futuras)',
          description:
            'Calcula a soma de todas as parcelas pendentes de um cartão, incluindo a fatura atual e todas as faturas futuras já registradas.',
          tags: ['Cards'],
          params: z.object({ cardId: z.string() }),
          response: {
            200: z.object({ totalAmountCard: z.number() }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      async (request, reply) => {
        try {
          const total = await service.getTotalAmountUsed(request.params.cardId, request.user.id)
          return reply.send({ totalAmountCard: total })
        } catch (err) {
          if (err instanceof CardNotFoundError) {
            return reply.status(404).send({ message: err.message })
          }

          request.log.error(err)
          return reply.status(500).send({ message: 'Falha ao buscar total do cartão' })
        }
      },
    )

    // GET /api/cards/:cardId/month-total-amount
    app.get(
      '/api/cards/:cardId/month-total-amount',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Obter valor total da fatura para um mês específico',
          description:
            'Calcula a soma de todas as parcelas vinculadas à fatura de um cartão, respeitando o intervalo de responsabilidade de cada membro.',
          tags: ['Cards'],
          params: z.object({ cardId: z.string() }),
          querystring: z.object({
            month: z.coerce.number().int().min(0).max(11).optional(),
            year: z.coerce.number().int().optional(),
          }),
          response: {
            200: z.object({
              totalAmountMonth: z.number(),
              targetMonth: z.number(),
              targetYear: z.number(),
            }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      async (request, reply) => {
        try {
          const { cardId } = request.params
          const { month, year } = request.query
          const result = await service.getMonthTotalAmount(cardId, request.user.id, month, year)
          return reply.send({
            totalAmountMonth: result.total,
            targetMonth: result.targetMonth,
            targetYear: result.targetYear,
          })
        } catch (err) {
          if (err instanceof CardNotFoundError) {
            return reply.status(404).send({ message: err.message })
          }

          request.log.error(err)
          return reply.status(500).send({ message: 'Falha ao buscar total mensal do cartão' })
        }
      },
    )
  }
