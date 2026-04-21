import type { FastifyReply, FastifyRequest } from 'fastify'
import { CardNotFoundError } from '@/modules/cards/cards.errors'
import type { GetCardUseCase } from './get-card.use-case'

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
