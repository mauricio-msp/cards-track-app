import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { GetMemberPaymentsUseCase } from '@/modules/member-payments/application/use-cases/get-member-payments/get-member-payments.use-case'
import type { MemberPaymentPeriodQuery } from '@/modules/member-payments/http/dto/member-payments.dto'

export class GetMemberPaymentsController {
  constructor(private readonly useCase: GetMemberPaymentsUseCase) {}

  async handle(
    memberId: string,
    cardId: string,
    query: MemberPaymentPeriodQuery,
    reply: FastifyReply,
    log: FastifyBaseLogger,
  ) {
    try {
      const result = await this.useCase.execute(memberId, cardId, query.month, query.year)
      return reply.status(200).send(result)
    } catch (err) {
      log.error(err)
      return reply.status(500).send({ message: 'Falha ao buscar pagamentos' })
    }
  }
}
