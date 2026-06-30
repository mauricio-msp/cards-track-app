import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { GetCardUseCase } from '@/modules/cards/application/use-cases/get-card/get-card.use-case'
import { CardNotFoundError } from '@/modules/cards/domain/errors/cards.errors'

export class GetCardController {
  constructor(private readonly useCase: GetCardUseCase) {}

  async handle(cardId: string, userId: string, reply: FastifyReply, log: FastifyBaseLogger) {
    try {
      const card = await this.useCase.execute(cardId, userId)
      return reply.send({
        card: {
          name: card.name,
          limit: card.limit,
          dueDay: card.dueDay,
          closingOffsetDays: card.closingOffsetDays,
          anticipationMode: card.anticipationMode,
        },
      })
    } catch (err) {
      if (err instanceof CardNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }

      log.error(err)
      return reply.status(500).send({ message: 'Falha ao buscar o cartão' })
    }
  }
}
