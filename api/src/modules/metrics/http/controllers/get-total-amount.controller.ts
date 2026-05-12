import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { GetTotalAmountUseCase } from '@/modules/metrics/application/use-cases/get-total-amount/get-total-amount.use-case'

export class GetTotalAmountController {
  constructor(private readonly useCase: GetTotalAmountUseCase) {}

  async handle(userId: string, reply: FastifyReply, log: FastifyBaseLogger) {
    try {
      const totalAmount = await this.useCase.execute(userId)
      return reply.send({ totalAmount })
    } catch (err) {
      log.error(err)
      return reply.status(500).send({ message: 'Falha ao buscar total geral' })
    }
  }
}
