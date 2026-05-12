import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { authMiddleware } from '@/middleware/auth'
import type { CreateCardController } from '@/modules/cards/http/controllers/create-card.controller'
import type { DeleteCardController } from '@/modules/cards/http/controllers/delete-card.controller'
import type { GetCardController } from '@/modules/cards/http/controllers/get-card.controller'
import type { GetCardPurchasesController } from '@/modules/cards/http/controllers/get-card-purchases.controller'
import type { GetCardsController } from '@/modules/cards/http/controllers/get-cards.controller'
import type { GetMonthTotalAmountController } from '@/modules/cards/http/controllers/get-month-total-amount.controller'
import type { GetTotalAmountUsedController } from '@/modules/cards/http/controllers/get-total-amount-used.controller'
import type { UpdateCardController } from '@/modules/cards/http/controllers/update-card.controller'
import {
  cardSchema,
  createCardDto,
  getCardPurchasesQueryDto,
  updateCardDto,
} from '@/modules/cards/http/dto/cards.dto'

type Controllers = {
  createCard: CreateCardController
  getCards: GetCardsController
  getCard: GetCardController
  updateCard: UpdateCardController
  deleteCard: DeleteCardController
  getCardPurchases: GetCardPurchasesController
  getTotalAmountUsed: GetTotalAmountUsedController
  getMonthTotalAmount: GetMonthTotalAmountController
}

export const cardsRoutes =
  (controllers: Controllers): FastifyPluginAsyncZod =>
  async app => {
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
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) => controllers.createCard.handle(req as any, reply),
    )

    app.get(
      '/api/cards',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Listar todos os cartões de crédito do usuário',
          tags: ['Cards'],
          response: {
            200: z.object({
              cards: z.array(cardSchema.omit({ createdAt: true, ownerUserId: true })),
            }),
          },
        },
      },
      (req, reply) => controllers.getCards.handle(req as any, reply),
    )

    app.get(
      '/api/cards/:cardId',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Obter detalhes do cartão pelo ID',
          tags: ['Cards'],
          params: z.object({ cardId: z.string().uuid() }),
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
      (req, reply) => controllers.getCard.handle(req as any, reply),
    )

    app.patch(
      '/api/cards/:id',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Atualizar um cartão',
          tags: ['Cards'],
          params: z.object({ id: z.string().uuid() }),
          body: updateCardDto,
          response: {
            200: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) => controllers.updateCard.handle(req as any, reply),
    )

    app.delete(
      '/api/cards/:cardId',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Excluir um cartão',
          description:
            'Exclui um cartão somente se não houver parcelas pendentes em nenhuma fatura.',
          tags: ['Cards'],
          params: z.object({ cardId: z.string().uuid() }),
          response: {
            200: z.object({ message: z.string() }),
            400: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) => controllers.deleteCard.handle(req as any, reply),
    )

    app.get(
      '/api/cards/:cardId/purchases',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Obter compras do cartão por mês',
          tags: ['Cards'],
          params: z.object({ cardId: z.string().uuid() }),
          querystring: getCardPurchasesQueryDto,
          response: {
            200: z.object({
              purchases: z.array(
                z.object({
                  purchaseMemberId: z.string(),
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
                  anticipatableInstallments: z.number(),
                  subscriptionId: z.string().nullable(),
                  members: z.array(
                    z.object({
                      id: z.string(),
                      name: z.string(),
                      relationship: z.string(),
                      installmentAmount: z.number(),
                      perInstallmentAmount: z.number(),
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
      (req, reply) => controllers.getCardPurchases.handle(req as any, reply),
    )

    app.get(
      '/api/cards/:cardId/total-amount-used',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Obter saldo total usado (parcelas futuras)',
          tags: ['Cards'],
          params: z.object({ cardId: z.string().uuid() }),
          response: {
            200: z.object({ totalAmountCard: z.number() }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) => controllers.getTotalAmountUsed.handle(req as any, reply),
    )

    app.get(
      '/api/cards/:cardId/month-total-amount',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Obter valor total da fatura para um mês específico',
          tags: ['Cards'],
          params: z.object({ cardId: z.string().uuid() }),
          querystring: getCardPurchasesQueryDto,
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
      (req, reply) => controllers.getMonthTotalAmount.handle(req as any, reply),
    )
  }
