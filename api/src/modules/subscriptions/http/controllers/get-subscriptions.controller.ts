import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { GetSubscriptionsUseCase } from '@/modules/subscriptions/application/use-cases/get-subscriptions/get-subscriptions.use-case'

export class GetSubscriptionsController {
  constructor(private readonly useCase: GetSubscriptionsUseCase) {}

  async handle(userId: string, reply: FastifyReply, log: FastifyBaseLogger) {
    try {
      const subscriptions = await this.useCase.execute(userId)
      return reply.status(200).send({ subscriptions })
    } catch (err) {
      log.error(err)
      return reply.status(500).send({ message: 'Falha ao listar assinaturas' })
    }
  }
}
