import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { CreateCardUseCase } from '@/modules/cards/application/use-cases/create-card/create-card.use-case'
import type { CreateCardInput } from '@/modules/cards/http/dto/cards.dto'

export class CreateCardController {
  constructor(private readonly useCase: CreateCardUseCase) {}

  async handle(body: CreateCardInput, userId: string, reply: FastifyReply, log: FastifyBaseLogger) {
    try {
      const card = await this.useCase.execute(userId, body)
      return reply.status(201).send({ card, message: 'Cartão criado com sucesso!' })
    } catch (err) {
      log.error(err)
      return reply.status(500).send({ message: 'Falha ao criar cartão. Tente novamente.' })
    }
  }
}
