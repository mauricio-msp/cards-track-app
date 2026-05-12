import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetPurchasesTrendUseCase } from '@/modules/purchases/application/use-cases/get-purchases-trend/get-purchases-trend.use-case'

export class GetPurchasesTrendController {
  constructor(private readonly useCase: GetPurchasesTrendUseCase) {}

  async handle(request: FastifyRequest<{ Querystring: { year?: number } }>, reply: FastifyReply) {
    const year = request.query.year ?? new Date().getFullYear()
    const chartData = await this.useCase.execute(request.user.id, year)
    return reply.send({ chartData })
  }
}
