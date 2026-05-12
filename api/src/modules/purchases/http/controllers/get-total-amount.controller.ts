import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetTotalAmountUseCase } from '@/modules/purchases/application/use-cases/get-total-amount/get-total-amount.use-case'

export class GetTotalAmountController {
  constructor(private readonly useCase: GetTotalAmountUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const totalAmount = await this.useCase.execute(request.user.id)
    return reply.send({ totalAmount })
  }
}
