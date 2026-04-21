import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetMonthHighestDebtsAmountUseCase } from './get-month-highest-debts-amount.use-case'

export class GetMonthHighestDebtsAmountController {
  constructor(private readonly useCase: GetMonthHighestDebtsAmountUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const now = new Date()
    const result = await this.useCase.execute(request.user.id, now.getMonth(), now.getFullYear())
    return reply.status(200).send(result)
  }
}
