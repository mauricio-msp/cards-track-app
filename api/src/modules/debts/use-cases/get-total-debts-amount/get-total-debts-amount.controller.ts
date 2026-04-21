import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetTotalDebtsAmountUseCase } from './get-total-debts-amount.use-case'

export class GetTotalDebtsAmountController {
  constructor(private readonly useCase: GetTotalDebtsAmountUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const totalAmount = await this.useCase.execute(request.user.id)
    return reply.status(200).send({ totalAmount })
  }
}
