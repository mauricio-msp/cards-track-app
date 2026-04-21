import type { FastifyReply, FastifyRequest } from 'fastify'
import type { UpdateSubscriptionInput } from '@/modules/subscriptions/subscriptions.dto'
import {
  SubscriptionCardNotFoundError,
  SubscriptionNotFoundError,
} from '@/modules/subscriptions/subscriptions.errors'
import type { UpdateSubscriptionUseCase } from './update-subscription.use-case'

export class UpdateSubscriptionController {
  constructor(private readonly useCase: UpdateSubscriptionUseCase) {}

  async handle(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateSubscriptionInput }>,
    reply: FastifyReply,
  ) {
    try {
      await this.useCase.execute(request.params.id, request.user.id, request.body)
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
  }
}
