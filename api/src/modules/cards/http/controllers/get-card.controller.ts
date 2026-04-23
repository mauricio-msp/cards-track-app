import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetCardUseCase } from '@/modules/cards/application/use-cases/get-card/get-card.use-case'
import { CardNotFoundError } from '@/modules/cards/domain/errors/cards.errors'

export class GetCardController {
  constructor(private readonly useCase: GetCardUseCase) {}

  async handle(request: FastifyRequest<{ Params: { cardId: string } }>, reply: FastifyReply) {
    try {
      const card = await this.useCase.execute(request.params.cardId, request.user.id)
      return reply.send({
        card: {
          name: card.name,
          limit: card.limit,
          dueDay: card.dueDay,
          closingOffsetDays: card.closingOffsetDays,
        },
      })
    } catch (err) {
      if (err instanceof CardNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }
      request.log.error(err)
      return reply.status(500).send({ message: 'Falha ao buscar o cartão' })
    }
  }
}
