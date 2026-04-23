import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetMonthHighestDebtsAmountUseCase } from '@/modules/debts/application/use-cases/get-month-highest-debts-amount/get-month-highest-debts-amount.use-case'

export class GetMonthHighestDebtsAmountController {
  constructor(private readonly useCase: GetMonthHighestDebtsAmountUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const now = new Date()
      const result = await this.useCase.execute(request.user.id, now.getMonth(), now.getFullYear())
      return reply.status(200).send(result)
    } catch (err) {
      request.log.error(err)
      return reply.status(500).send({ message: 'Falha ao obter maior valor de fatura do mês' })
    }
  }
}
