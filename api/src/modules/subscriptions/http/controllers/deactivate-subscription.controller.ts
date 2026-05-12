import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { DeactivateSubscriptionUseCase } from '@/modules/subscriptions/application/use-cases/deactivate-subscription/deactivate-subscription.use-case'
import { SubscriptionNotFoundError } from '@/modules/subscriptions/domain/errors/subscriptions.errors'

export class DeactivateSubscriptionController {
  constructor(private readonly useCase: DeactivateSubscriptionUseCase) {}

  async handle(id: string, userId: string, reply: FastifyReply, log: FastifyBaseLogger) {
    try {
      await this.useCase.execute(id, userId)
      return reply.status(200).send({ message: 'Assinatura desativada com sucesso' })
    } catch (err) {
      if (err instanceof SubscriptionNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }
      log.error(err)
      return reply.status(500).send({ message: 'Falha ao desativar assinatura' })
    }
  }
}
