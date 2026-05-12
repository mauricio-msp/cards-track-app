import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { DeletePurchaseMemberUseCase } from '@/modules/purchases/application/use-cases/delete-purchase-member/delete-purchase-member.use-case'
import { PurchaseNotFoundError } from '@/modules/purchases/domain/errors/purchases.errors'

export class DeletePurchaseMemberController {
  constructor(private readonly useCase: DeletePurchaseMemberUseCase) {}

  async handle(pmId: string, memberId: string, userId: string, reply: FastifyReply, log: FastifyBaseLogger) {
    try {
      await this.useCase.execute(pmId, memberId, userId)
      return reply.send({ message: 'Membro removido da compra com sucesso' })
    } catch (err) {
      if (err instanceof PurchaseNotFoundError) return reply.status(404).send({ message: err.message })
      log.error(err)
      return reply.status(500).send({ message: 'Erro ao remover membro' })
    }
  }
}
