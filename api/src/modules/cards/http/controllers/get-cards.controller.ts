import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { GetCardsUseCase } from '@/modules/cards/application/use-cases/get-cards/get-cards.use-case'

export class GetCardsController {
  constructor(private readonly useCase: GetCardsUseCase) {}

  async handle(userId: string, reply: FastifyReply, log: FastifyBaseLogger) {
    try {
      const rows = await this.useCase.execute(userId)
      return reply.status(200).send({ cards: rows })
    } catch (err) {
      log.error(err)
      return reply.status(500).send({ message: 'Falha ao buscar cartões' })
    }
  }
}
