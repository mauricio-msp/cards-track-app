import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { DeletePurchaseUseCase } from '@/modules/purchases/application/use-cases/delete-purchase/delete-purchase.use-case'
import { PurchaseNotFoundError } from '@/modules/purchases/domain/errors/purchases.errors'

export class DeletePurchaseController {
  constructor(private readonly useCase: DeletePurchaseUseCase) {}

  async handle(pmId: string, userId: string, reply: FastifyReply, log: FastifyBaseLogger) {
    try {
      await this.useCase.execute(pmId, userId)
      return reply.send({ message: 'Compra excluída com sucesso' })
    } catch (err) {
      if (err instanceof PurchaseNotFoundError) return reply.status(404).send({ message: err.message })
      log.error(err)
      return reply.status(500).send({ message: 'Erro ao excluir compra' })
    }
  }
}
