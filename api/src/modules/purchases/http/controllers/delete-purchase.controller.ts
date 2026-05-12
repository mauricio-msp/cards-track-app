import type { FastifyReply, FastifyRequest } from 'fastify'
import { PurchaseNotFoundError } from '@/modules/purchases/domain/errors/purchases.errors'
import type { DeletePurchaseUseCase } from '@/modules/purchases/application/use-cases/delete-purchase/delete-purchase.use-case'

export class DeletePurchaseController {
  constructor(private readonly useCase: DeletePurchaseUseCase) {}

  async handle(request: FastifyRequest<{ Params: { pmId: string } }>, reply: FastifyReply) {
    try {
      await this.useCase.execute(request.params.pmId, request.user.id)
      return reply.send({ message: 'Compra excluída com sucesso' })
    } catch (err) {
      if (err instanceof PurchaseNotFoundError) return reply.status(404).send({ message: err.message })
      request.log.error(err)
      return reply.status(500).send({ message: 'Erro ao excluir compra' })
    }
  }
}
