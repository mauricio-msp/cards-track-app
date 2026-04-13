import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { authMiddleware } from '@/middleware/auth'
import { createSubscriptionDto, updateSubscriptionDto } from '@/modules/subscriptions/subscriptions.dto'
import {
  SubscriptionCardNotFoundError,
  SubscriptionMemberNotFoundError,
  SubscriptionNotFoundError,
} from '@/modules/subscriptions/subscriptions.errors'
import type { SubscriptionsService } from '@/modules/subscriptions/subscriptions.service'

export const subscriptionsController =
  (service: SubscriptionsService): FastifyPluginAsyncZod =>
  async app => {
    // POST /api/subscriptions
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
      async (request, reply) => {
        try {
          const sub = await service.create(request.user.id, request.body)
          return reply.status(201).send({
            subscription: { ...sub, createdAt: sub.createdAt.toISOString() },
          })
        } catch (err) {
          if (
            err instanceof SubscriptionCardNotFoundError ||
            err instanceof SubscriptionMemberNotFoundError
          ) {
            return reply.status(400).send({ message: err.message })
          }
          request.log.error(err)
          return reply.status(500).send({ message: 'Falha ao criar assinatura' })
        }
      },
    )

    // GET /api/subscriptions
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
      async (request, reply) => {
        const rows = await service.findAll(request.user.id)
        return reply.status(200).send({
          subscriptions: rows.map(r => ({ ...r, createdAt: r.createdAt.toISOString() })),
        })
      },
    )

    // PATCH /api/subscriptions/:id
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
      async (request, reply) => {
        try {
          await service.update(request.params.id, request.user.id, request.body)
          return reply.status(200).send({ message: 'Assinatura atualizada com sucesso' })
        } catch (err) {
          if (err instanceof SubscriptionNotFoundError) {
            return reply.status(404).send({ message: err.message })
          }
          if (err instanceof SubscriptionCardNotFoundError) {
            return reply.status(400).send({ message: err.message })
          }
          request.log.error(err)
          return reply.status(500).send({ message: 'Falha ao atualizar assinatura' })
        }
      },
    )

    // DELETE /api/subscriptions/:id
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
      async (request, reply) => {
        try {
          await service.deactivate(request.params.id, request.user.id)
          return reply.status(200).send({ message: 'Assinatura desativada com sucesso' })
        } catch (err) {
          if (err instanceof SubscriptionNotFoundError) {
            return reply.status(404).send({ message: err.message })
          }
          request.log.error(err)
          return reply.status(500).send({ message: 'Falha ao desativar assinatura' })
        }
      },
    )
  }
