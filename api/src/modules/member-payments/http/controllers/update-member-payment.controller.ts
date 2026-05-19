import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { UpdateMemberPaymentUseCase } from '@/modules/member-payments/application/use-cases/update-member-payment/update-member-payment.use-case'
import { MemberPaymentNotFoundError } from '@/modules/member-payments/domain/errors/member-payments.errors'
import type { UpdateMemberPaymentInput } from '@/modules/member-payments/http/dto/member-payments.dto'

export class UpdateMemberPaymentController {
  constructor(private readonly useCase: UpdateMemberPaymentUseCase) {}

  async handle(
    paymentId: string,
    body: UpdateMemberPaymentInput,
    reply: FastifyReply,
    log: FastifyBaseLogger,
  ) {
    try {
      const payment = await this.useCase.execute(paymentId, body)
      return reply.status(200).send({ payment, message: 'Pagamento atualizado com sucesso!' })
    } catch (err) {
      if (err instanceof MemberPaymentNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }
      log.error(err)
      return reply.status(500).send({ message: 'Falha ao atualizar pagamento' })
    }
  }
}
