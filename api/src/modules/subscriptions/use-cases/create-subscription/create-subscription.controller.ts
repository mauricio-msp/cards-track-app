import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateSubscriptionInput } from '@/modules/subscriptions/subscriptions.dto'
import {
  SubscriptionCardNotFoundError,
  SubscriptionMemberNotFoundError,
} from '@/modules/subscriptions/subscriptions.errors'
import type { CreateSubscriptionUseCase } from './create-subscription.use-case'

export class CreateSubscriptionController {
  constructor(private readonly useCase: CreateSubscriptionUseCase) {}

  async handle(request: FastifyRequest<{ Body: CreateSubscriptionInput }>, reply: FastifyReply) {
    try {
      const sub = await this.useCase.execute(request.user.id, request.body)
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
  }
}
