import type { FastifyReply, FastifyRequest } from 'fastify'
import { SubscriptionNotFoundError } from '@/modules/subscriptions/subscriptions.errors'
import type { DeactivateSubscriptionUseCase } from './deactivate-subscription.use-case'

export class DeactivateSubscriptionController {
  constructor(private readonly useCase: DeactivateSubscriptionUseCase) {}

  async handle(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      await this.useCase.execute(request.params.id, request.user.id)
      return reply.status(200).send({ message: 'Assinatura desativada com sucesso' })
    } catch (err) {
      if (err instanceof SubscriptionNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }
      request.log.error(err)
      return reply.status(500).send({ message: 'Falha ao desativar assinatura' })
    }
  }
}
