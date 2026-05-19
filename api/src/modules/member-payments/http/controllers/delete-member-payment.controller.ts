import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { DeleteMemberPaymentUseCase } from '@/modules/member-payments/application/use-cases/delete-member-payment/delete-member-payment.use-case'
import { MemberPaymentNotFoundError } from '@/modules/member-payments/domain/errors/member-payments.errors'

export class DeleteMemberPaymentController {
  constructor(private readonly useCase: DeleteMemberPaymentUseCase) {}

  async handle(paymentId: string, reply: FastifyReply, log: FastifyBaseLogger) {
    try {
      await this.useCase.execute(paymentId)
      return reply.status(200).send({ message: 'Pagamento removido com sucesso!' })
    } catch (err) {
      if (err instanceof MemberPaymentNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }
      log.error(err)
      return reply.status(500).send({ message: 'Falha ao remover pagamento' })
    }
  }
}
