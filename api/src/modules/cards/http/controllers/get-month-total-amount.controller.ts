import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { GetMonthTotalAmountUseCase } from '@/modules/cards/application/use-cases/get-month-total-amount/get-month-total-amount.use-case'
import { CardNotFoundError } from '@/modules/cards/domain/errors/cards.errors'
import type { CardPeriodQuery } from '@/modules/cards/http/dto/cards.dto'

export class GetMonthTotalAmountController {
  constructor(private readonly useCase: GetMonthTotalAmountUseCase) {}

  async handle(
    cardId: string,
    userId: string,
    query: CardPeriodQuery,
    reply: FastifyReply,
    log: FastifyBaseLogger,
  ) {
    try {
      const result = await this.useCase.execute(cardId, userId, query.month, query.year)
      return reply.send({
        totalAmountMonth: result.total,
        targetMonth: result.targetMonth,
        targetYear: result.targetYear,
      })
    } catch (err) {
      if (err instanceof CardNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }

      log.error(err)
      return reply.status(500).send({ message: 'Falha ao buscar total mensal do cartão' })
    }
  }
}
