import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateSubscriptionUseCase } from '@/modules/subscriptions/application/use-cases/create-subscription/create-subscription.use-case'
import {
  SubscriptionCardNotFoundError,
  SubscriptionMemberNotFoundError,
} from '@/modules/subscriptions/domain/errors/subscriptions.errors'
import type { CreateSubscriptionInput } from '@/modules/subscriptions/http/dto/subscriptions.dto'

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
