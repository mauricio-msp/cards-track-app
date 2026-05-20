import type { FastifyBaseLogger, FastifyReply } from 'fastify'

import { PaymentForPastPeriodError } from '@/modules/member-payments/domain/errors/member-payments.errors'
import type { CreateMemberPaymentUseCase } from '@/modules/member-payments/application/use-cases/create-member-payment/create-member-payment.use-case'
import type { CreateMemberPaymentInput } from '@/modules/member-payments/http/dto/member-payments.dto'

export class CreateMemberPaymentController {
  constructor(private readonly useCase: CreateMemberPaymentUseCase) {}

  async handle(
    memberId: string,
    cardId: string,
    body: CreateMemberPaymentInput,
    reply: FastifyReply,
    log: FastifyBaseLogger,
  ) {
    try {
      const payment = await this.useCase.execute(memberId, cardId, body)
      return reply.status(201).send({ payment, message: 'Pagamento registrado com sucesso!' })
    } catch (err) {
      if (err instanceof PaymentForPastPeriodError) {
        return reply.status(422).send({ message: err.message })
      }
      log.error(err)
      return reply.status(500).send({ message: 'Falha ao registrar pagamento' })
    }
  }
}
