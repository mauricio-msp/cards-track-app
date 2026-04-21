import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetDebtsTrendUseCase } from './get-debts-trend.use-case'

export class GetDebtsTrendController {
  constructor(private readonly useCase: GetDebtsTrendUseCase) {}

  async handle(
    request: FastifyRequest<{ Querystring: { year?: number } }>,
    reply: FastifyReply,
  ) {
    const year = request.query.year ?? new Date().getFullYear()
    const chartData = await this.useCase.execute(request.user.id, year)
    return reply.status(200).send({ chartData })
  }
}
