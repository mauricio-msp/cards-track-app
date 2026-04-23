import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetMonthLowestDebtsAmountUseCase } from '@/modules/debts/application/use-cases/get-month-lowest-debts-amount/get-month-lowest-debts-amount.use-case'

export class GetMonthLowestDebtsAmountController {
  constructor(private readonly useCase: GetMonthLowestDebtsAmountUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const now = new Date()
      const result = await this.useCase.execute(request.user.id, now.getMonth(), now.getFullYear())
      return reply.status(200).send(result)
    } catch (err) {
      request.log.error(err)
      return reply.status(500).send({ message: 'Falha ao obter menor valor de fatura do mês' })
    }
  }
}
