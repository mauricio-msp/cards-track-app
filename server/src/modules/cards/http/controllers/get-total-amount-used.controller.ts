import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetTotalAmountUsedUseCase } from '@/modules/cards/application/use-cases/get-total-amount-used/get-total-amount-used.use-case'
import { CardNotFoundError } from '@/modules/cards/domain/errors/cards.errors'

export class GetTotalAmountUsedController {
  constructor(private readonly useCase: GetTotalAmountUsedUseCase) {}

  async handle(request: FastifyRequest<{ Params: { cardId: string } }>, reply: FastifyReply) {
    try {
      const total = await this.useCase.execute(request.params.cardId, request.user.id)
      return reply.send({ totalAmountCard: total })
    } catch (err) {
      if (err instanceof CardNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }
      request.log.error(err)
      return reply.status(500).send({ message: 'Falha ao buscar total do cartão' })
    }
  }
}
