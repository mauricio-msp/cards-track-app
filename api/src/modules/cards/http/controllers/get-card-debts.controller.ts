import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetCardDebtsUseCase } from '@/modules/cards/application/use-cases/get-card-debts/get-card-debts.use-case'
import { CardNotFoundError } from '@/modules/cards/domain/errors/cards.errors'

export class GetCardDebtsController {
  constructor(private readonly useCase: GetCardDebtsUseCase) {}

  async handle(
    request: FastifyRequest<{
      Params: { cardId: string }
      Querystring: { month?: number; year?: number }
    }>,
    reply: FastifyReply,
  ) {
    try {
      const cardDebts = await this.useCase.execute(
        request.params.cardId,
        request.user.id,
        request.query.month,
        request.query.year,
      )
      return reply.send({ debts: cardDebts })
    } catch (err) {
      if (err instanceof CardNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }
      request.log.error(err)
      return reply.status(500).send({ message: 'Falha ao buscar despesas do cartão' })
    }
  }
}
