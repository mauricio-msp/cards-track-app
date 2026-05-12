import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { UpdateSubscriptionUseCase } from '@/modules/subscriptions/application/use-cases/update-subscription/update-subscription.use-case'
import {
  SubscriptionCardNotFoundError,
  SubscriptionNotFoundError,
} from '@/modules/subscriptions/domain/errors/subscriptions.errors'
import type { UpdateSubscriptionInput } from '@/modules/subscriptions/http/dto/subscriptions.dto'

export class UpdateSubscriptionController {
  constructor(private readonly useCase: UpdateSubscriptionUseCase) {}

  async handle(id: string, body: UpdateSubscriptionInput, userId: string, reply: FastifyReply, log: FastifyBaseLogger) {
    try {
      await this.useCase.execute(id, userId, body)
      return reply.status(200).send({ message: 'Assinatura atualizada com sucesso' })
    } catch (err) {
      if (err instanceof SubscriptionNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }
      if (err instanceof SubscriptionCardNotFoundError) {
        return reply.status(400).send({ message: err.message })
      }
      log.error(err)
      return reply.status(500).send({ message: 'Falha ao atualizar assinatura' })
    }
  }
}
