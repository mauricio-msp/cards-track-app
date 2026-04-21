import type { FastifyReply, FastifyRequest } from 'fastify'
import { DebtNotFoundError } from '@/modules/debts/debts.errors'
import type { DeleteDebtMemberUseCase } from './delete-debt-member.use-case'

export class DeleteDebtMemberController {
  constructor(private readonly useCase: DeleteDebtMemberUseCase) {}

  async handle(
    request: FastifyRequest<{ Params: { debtId: string; memberId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      await this.useCase.execute(request.params.debtId, request.params.memberId, request.user.id)
      return reply.status(200).send({ message: 'Membro removido da despesa com sucesso!' })
    } catch (err) {
      if (err instanceof DebtNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }
      request.log.error(err)
      return reply.status(500).send({ message: 'Falha ao remover membro da despesa' })
    }
  }
}
