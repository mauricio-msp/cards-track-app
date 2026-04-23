import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetCardsUseCase } from '@/modules/cards/application/use-cases/get-cards/get-cards.use-case'

export class GetCardsController {
  constructor(private readonly useCase: GetCardsUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const rows = await this.useCase.execute(request.user.id)
      return reply.status(200).send({ cards: rows })
    } catch (err) {
      request.log.error(err)
      return reply.status(500).send({ message: 'Falha ao buscar cartões' })
    }
  }
}
