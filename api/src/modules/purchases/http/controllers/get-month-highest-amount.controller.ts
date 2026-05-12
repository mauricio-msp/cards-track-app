import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetMonthHighestAmountUseCase } from '@/modules/purchases/application/use-cases/get-month-highest-amount/get-month-highest-amount.use-case'

export class GetMonthHighestAmountController {
  constructor(private readonly useCase: GetMonthHighestAmountUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const result = await this.useCase.execute(request.user.id)
    return reply.send(result)
  }
}
