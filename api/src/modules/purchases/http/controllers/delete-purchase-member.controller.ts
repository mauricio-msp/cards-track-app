import type { FastifyReply, FastifyRequest } from 'fastify'
import { PurchaseNotFoundError } from '@/modules/purchases/domain/errors/purchases.errors'
import type { DeletePurchaseMemberUseCase } from '@/modules/purchases/application/use-cases/delete-purchase-member/delete-purchase-member.use-case'

export class DeletePurchaseMemberController {
  constructor(private readonly useCase: DeletePurchaseMemberUseCase) {}

  async handle(request: FastifyRequest<{ Params: { pmId: string; memberId: string } }>, reply: FastifyReply) {
    try {
      await this.useCase.execute(request.params.pmId, request.params.memberId, request.user.id)
      return reply.send({ message: 'Membro removido da compra com sucesso' })
    } catch (err) {
      if (err instanceof PurchaseNotFoundError) return reply.status(404).send({ message: err.message })
      request.log.error(err)
      return reply.status(500).send({ message: 'Erro ao remover membro' })
    }
  }
}
