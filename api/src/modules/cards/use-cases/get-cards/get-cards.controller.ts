import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetCardsUseCase } from './get-cards.use-case'

export class GetCardsController {
  constructor(private readonly useCase: GetCardsUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const rows = await this.useCase.execute(request.user.id)
    return reply.status(200).send({ cards: rows })
  }
}
