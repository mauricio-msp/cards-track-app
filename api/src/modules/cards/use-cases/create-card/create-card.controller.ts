import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateCardInput } from '@/modules/cards/cards.dto'
import type { CreateCardUseCase } from './create-card.use-case'

export class CreateCardController {
  constructor(private readonly useCase: CreateCardUseCase) {}

  async handle(request: FastifyRequest<{ Body: CreateCardInput }>, reply: FastifyReply) {
    try {
      const card = await this.useCase.execute(request.user.id, request.body)
      return reply.status(201).send({ card, message: 'Cartão criado com sucesso!' })
    } catch (err) {
      request.log.error(err)
      return reply.status(400).send({ message: 'Falha ao criar cartão. Verifique os dados e tente novamente.' })
    }
  }
}
