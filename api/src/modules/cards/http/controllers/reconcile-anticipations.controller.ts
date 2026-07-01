import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import { CardNotFoundError } from '@/modules/cards/domain/errors/cards.errors'
import type { ReconcileAnticipationsUseCase } from '@/modules/cards/application/use-cases/reconcile-anticipations/reconcile-anticipations.use-case'

export class ReconcileAnticipationsController {
  constructor(private readonly useCase: ReconcileAnticipationsUseCase) {}

  async handle(cardId: string, userId: string, reply: FastifyReply, log: FastifyBaseLogger) {
    try {
      const result = await this.useCase.execute(cardId, userId)
      return reply.send(result)
    } catch (err) {
      if (err instanceof CardNotFoundError) return reply.status(404).send({ message: err.message })
      log.error(err)
      return reply.status(500).send({ message: 'Erro ao reconciliar antecipações' })
    }
  }
}
