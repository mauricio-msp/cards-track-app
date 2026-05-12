import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { GetMonthTotalAmountUseCase } from '@/modules/metrics/application/use-cases/get-month-total-amount/get-month-total-amount.use-case'

export class GetMonthTotalAmountController {
  constructor(private readonly useCase: GetMonthTotalAmountUseCase) {}

  async handle(userId: string, reply: FastifyReply, log: FastifyBaseLogger) {
    try {
      const totalAmount = await this.useCase.execute(userId)
      return reply.send({ totalAmount })
    } catch (err) {
      log.error(err)
      return reply.status(500).send({ message: 'Falha ao buscar total do mês' })
    }
  }
}
