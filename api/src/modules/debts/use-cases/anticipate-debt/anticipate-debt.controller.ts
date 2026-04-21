import type { FastifyReply, FastifyRequest } from 'fastify'
import type { AnticipateDebtInput } from '@/modules/debts/debts.dto'
import {
  DebtAlreadyAnticipatedError,
  DebtNotFoundError,
  DebtSharedBetweenMembersError,
  InvalidAnticipateInstallmentError,
  NoUnpaidInstallmentsError,
} from '@/modules/debts/debts.errors'
import type { AnticipateDebtUseCase } from './anticipate-debt.use-case'

export class AnticipateDebtController {
  constructor(private readonly useCase: AnticipateDebtUseCase) {}

  async handle(
    request: FastifyRequest<{ Params: { debtId: string }; Body: AnticipateDebtInput }>,
    reply: FastifyReply,
  ) {
    try {
      const result = await this.useCase.execute(request.params.debtId, request.user.id, request.body)
      return reply.status(200).send({ message: 'Installments anticipated successfully', ...result })
    } catch (err) {
      if (err instanceof DebtNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }
      if (
        err instanceof DebtAlreadyAnticipatedError ||
        err instanceof DebtSharedBetweenMembersError ||
        err instanceof NoUnpaidInstallmentsError ||
        err instanceof InvalidAnticipateInstallmentError
      ) {
        return reply.status(400).send({ message: err.message })
      }
      request.log.error(err)
      return reply.status(500).send({ message: 'Falha ao antecipar parcelas' })
    }
  }
}
