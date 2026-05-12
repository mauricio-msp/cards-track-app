import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { GetTotalAmountUsedUseCase } from '@/modules/cards/application/use-cases/get-total-amount-used/get-total-amount-used.use-case'
import { CardNotFoundError } from '@/modules/cards/domain/errors/cards.errors'

export class GetTotalAmountUsedController {
  constructor(private readonly useCase: GetTotalAmountUsedUseCase) {}

  async handle(cardId: string, userId: string, reply: FastifyReply, log: FastifyBaseLogger) {
    try {
      const total = await this.useCase.execute(cardId, userId)
      return reply.send({ totalAmountCard: total })
    } catch (err) {
      if (err instanceof CardNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }

      log.error(err)
      return reply.status(500).send({ message: 'Falha ao buscar total do cartão' })
    }
  }
}
