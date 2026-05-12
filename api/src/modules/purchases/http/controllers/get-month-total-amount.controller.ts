import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetMonthTotalAmountUseCase } from '@/modules/purchases/application/use-cases/get-month-total-amount/get-month-total-amount.use-case'

export class GetMonthTotalAmountController {
  constructor(private readonly useCase: GetMonthTotalAmountUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const totalAmount = await this.useCase.execute(request.user.id)
    return reply.send({ totalAmount })
  }
}
