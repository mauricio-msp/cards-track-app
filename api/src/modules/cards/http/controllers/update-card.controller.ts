import type { FastifyReply, FastifyRequest } from 'fastify'
import type { UpdateCardUseCase } from '@/modules/cards/application/use-cases/update-card/update-card.use-case'
import { CardNotFoundError } from '@/modules/cards/domain/errors/cards.errors'
import type { UpdateCardInput } from '@/modules/cards/http/dto/cards.dto'

export class UpdateCardController {
  constructor(private readonly useCase: UpdateCardUseCase) {}

  async handle(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateCardInput }>,
    reply: FastifyReply,
  ) {
    try {
      await this.useCase.execute(request.params.id, request.user.id, request.body)
      return reply.send({ message: 'Cartão atualizado com sucesso' })
    } catch (err) {
      if (err instanceof CardNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }
      request.log.error(err)
      return reply.status(500).send({ message: 'Falha ao atualizar o cartão' })
    }
  }
}
