import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetPurchasesYearsUseCase } from '@/modules/purchases/application/use-cases/get-purchases-years/get-purchases-years.use-case'

export class GetPurchasesYearsController {
  constructor(private readonly useCase: GetPurchasesYearsUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const years = await this.useCase.execute(request.user.id)
    return reply.send({ years })
  }
}
