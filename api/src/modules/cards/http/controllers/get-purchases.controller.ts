import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { GetPurchasesUseCase } from '@/modules/cards/application/use-cases/get-purchases/get-purchases.use-case'
import { CardNotFoundError } from '@/modules/cards/domain/errors/cards.errors'
import type { CardPeriodQuery } from '@/modules/cards/http/dto/cards.dto'

export class GetPurchasesController {
  constructor(private readonly useCase: GetPurchasesUseCase) {}

  async handle(
    cardId: string,
    userId: string,
    query: CardPeriodQuery,
    reply: FastifyReply,
    log: FastifyBaseLogger,
  ) {
    try {
      const purchases = await this.useCase.execute(cardId, userId, query.month, query.year)
      return reply.send({ purchases })
    } catch (err) {
      if (err instanceof CardNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }

      log.error(err)
      return reply.status(500).send({ message: 'Falha ao buscar despesas do cartão' })
    }
  }
}
