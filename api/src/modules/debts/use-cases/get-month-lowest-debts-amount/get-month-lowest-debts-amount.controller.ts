import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetMonthLowestDebtsAmountUseCase } from './get-month-lowest-debts-amount.use-case'

export class GetMonthLowestDebtsAmountController {
  constructor(private readonly useCase: GetMonthLowestDebtsAmountUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const now = new Date()
    const result = await this.useCase.execute(request.user.id, now.getMonth(), now.getFullYear())
    return reply.status(200).send(result)
  }
}
