import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetMonthLowestAmountUseCase } from '@/modules/purchases/application/use-cases/get-month-lowest-amount/get-month-lowest-amount.use-case'

export class GetMonthLowestAmountController {
  constructor(private readonly useCase: GetMonthLowestAmountUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const result = await this.useCase.execute(request.user.id)
    return reply.send(result)
  }
}
