import type { FastifyReply, FastifyRequest } from 'fastify'
import { DebtNotFoundError } from '@/modules/debts/debts.errors'
import type { DeleteDebtUseCase } from './delete-debt.use-case'

export class DeleteDebtController {
  constructor(private readonly useCase: DeleteDebtUseCase) {}

  async handle(request: FastifyRequest<{ Params: { debtId: string } }>, reply: FastifyReply) {
    try {
      await this.useCase.execute(request.params.debtId, request.user.id)
      return reply.status(200).send({ message: 'Despesa excluída com sucesso!' })
    } catch (err) {
      if (err instanceof DebtNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }
      request.log.error(err)
      return reply.status(500).send({ message: 'Falha ao excluir despesa' })
    }
  }
}
