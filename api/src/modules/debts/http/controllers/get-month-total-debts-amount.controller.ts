import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetMonthTotalDebtsAmountUseCase } from '@/modules/debts/application/use-cases/get-month-total-debts-amount/get-month-total-debts-amount.use-case'

export class GetMonthTotalDebtsAmountController {
  constructor(private readonly useCase: GetMonthTotalDebtsAmountUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const totalAmount = await this.useCase.execute(request.user.id)
      return reply.status(200).send({ totalAmount })
    } catch (err) {
      request.log.error(err)
      return reply.status(500).send({ message: 'Falha ao obter total de despesas do mês' })
    }
  }
}
