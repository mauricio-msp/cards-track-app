import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { GetMonthHighestAmountUseCase } from '@/modules/metrics/application/use-cases/get-month-highest-amount/get-month-highest-amount.use-case'

export class GetMonthHighestAmountController {
  constructor(private readonly useCase: GetMonthHighestAmountUseCase) {}

  async handle(userId: string, reply: FastifyReply, log: FastifyBaseLogger) {
    try {
      const result = await this.useCase.execute(userId)
      return reply.send(result)
    } catch (err) {
      log.error(err)
      return reply.status(500).send({ message: 'Falha ao buscar maior fatura do mês' })
    }
  }
}
