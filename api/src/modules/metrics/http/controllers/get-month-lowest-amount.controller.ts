import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { GetMonthLowestAmountUseCase } from '@/modules/metrics/application/use-cases/get-month-lowest-amount/get-month-lowest-amount.use-case'

export class GetMonthLowestAmountController {
  constructor(private readonly useCase: GetMonthLowestAmountUseCase) {}

  async handle(userId: string, reply: FastifyReply, log: FastifyBaseLogger) {
    try {
      const result = await this.useCase.execute(userId)
      return reply.send(result)
    } catch (err) {
      log.error(err)
      return reply.status(500).send({ message: 'Falha ao buscar menor fatura do mês' })
    }
  }
}
