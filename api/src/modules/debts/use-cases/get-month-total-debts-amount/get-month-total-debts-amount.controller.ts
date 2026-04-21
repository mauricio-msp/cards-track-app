import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetMonthTotalDebtsAmountUseCase } from './get-month-total-debts-amount.use-case'

export class GetMonthTotalDebtsAmountController {
  constructor(private readonly useCase: GetMonthTotalDebtsAmountUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const totalAmount = await this.useCase.execute(request.user.id)
    return reply.status(200).send({ totalAmount })
  }
}
