import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetMonthTotalAmountUseCase } from '@/modules/cards/application/use-cases/get-month-total-amount/get-month-total-amount.use-case'
import { CardNotFoundError } from '@/modules/cards/domain/errors/cards.errors'

export class GetMonthTotalAmountController {
  constructor(private readonly useCase: GetMonthTotalAmountUseCase) {}

  async handle(
    request: FastifyRequest<{
      Params: { cardId: string }
      Querystring: { month?: number; year?: number }
    }>,
    reply: FastifyReply,
  ) {
    try {
      const result = await this.useCase.execute(
        request.params.cardId,
        request.user.id,
        request.query.month,
        request.query.year,
      )
      return reply.send({
        totalAmountMonth: result.total,
        targetMonth: result.targetMonth,
        targetYear: result.targetYear,
      })
    } catch (err) {
      if (err instanceof CardNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }
      request.log.error(err)
      return reply.status(500).send({ message: 'Falha ao buscar total mensal do cartão' })
    }
  }
}
