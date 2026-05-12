import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { authMiddleware } from '@/middleware/auth'
import type { CreateSubscriptionController } from '@/modules/subscriptions/http/controllers/create-subscription.controller'
import type { DeactivateSubscriptionController } from '@/modules/subscriptions/http/controllers/deactivate-subscription.controller'
import type { GetSubscriptionsController } from '@/modules/subscriptions/http/controllers/get-subscriptions.controller'
import type { UpdateSubscriptionController } from '@/modules/subscriptions/http/controllers/update-subscription.controller'
import {
  createSubscriptionDto,
  updateSubscriptionDto,
} from '@/modules/subscriptions/http/dto/subscriptions.dto'

type Controllers = {
  createSubscription: CreateSubscriptionController
  getSubscriptions: GetSubscriptionsController
  updateSubscription: UpdateSubscriptionController
  deactivateSubscription: DeactivateSubscriptionController
}

export const subscriptionsRoutes =
  (controllers: Controllers): FastifyPluginAsyncZod =>
  async app => {
    app.post(
      '/api/subscriptions',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Criar uma assinatura recorrente',
          tags: ['Subscriptions'],
          body: createSubscriptionDto,
          response: {
            201: z.object({
              subscription: z.object({
                id: z.string(),
                name: z.string(),
                amount: z.number(),
                billingDay: z.number(),
                cardId: z.string(),
                memberId: z.string(),
                active: z.boolean(),
                createdAt: z.string(),
              }),
            }),
            400: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) => controllers.createSubscription.handle(req as any, reply),
    )

    app.get(
      '/api/subscriptions',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Listar assinaturas do usuário',
          tags: ['Subscriptions'],
          response: {
            200: z.object({
              subscriptions: z.array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                  amount: z.number(),
                  billingDay: z.number(),
                  active: z.boolean(),
                  cardId: z.string(),
                  cardName: z.string(),
                  memberId: z.string(),
                  memberName: z.string(),
                  createdAt: z.string(),
                }),
              ),
            }),
          },
        },
      },
      (req, reply) => controllers.getSubscriptions.handle(req as any, reply),
    )

    app.patch(
      '/api/subscriptions/:id',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Atualizar assinatura recorrente',
          tags: ['Subscriptions'],
          params: z.object({ id: z.string() }),
          body: updateSubscriptionDto,
          response: {
            200: z.object({ message: z.string() }),
            400: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) => controllers.updateSubscription.handle(req as any, reply),
    )

    app.delete(
      '/api/subscriptions/:id',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Desativar assinatura recorrente',
          tags: ['Subscriptions'],
          params: z.object({ id: z.string() }),
          response: {
            200: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) => controllers.deactivateSubscription.handle(req as any, reply),
    )
  }
