import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { DeleteCardUseCase } from '@/modules/cards/application/use-cases/delete-card/delete-card.use-case'
import {
  CardHasActivePurchasesError,
  CardNotFoundError,
} from '@/modules/cards/domain/errors/cards.errors'

export class DeleteCardController {
  constructor(private readonly useCase: DeleteCardUseCase) {}

  async handle(cardId: string, userId: string, reply: FastifyReply, log: FastifyBaseLogger) {
    try {
      await this.useCase.execute(cardId, userId)
      return reply.send({ message: 'Cartão excluído com sucesso' })
    } catch (err) {
      if (err instanceof CardNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }

      if (err instanceof CardHasActivePurchasesError) {
        return reply.status(400).send({ message: err.message })
      }

      log.error(err)
      return reply.status(500).send({ message: 'Falha ao excluir o cartão' })
    }
  }
}
