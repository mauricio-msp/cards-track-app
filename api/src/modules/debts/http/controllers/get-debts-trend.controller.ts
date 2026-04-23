import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetDebtsTrendUseCase } from '@/modules/debts/application/use-cases/get-debts-trend/get-debts-trend.use-case'

export class GetDebtsTrendController {
  constructor(private readonly useCase: GetDebtsTrendUseCase) {}

  async handle(request: FastifyRequest<{ Querystring: { year?: number } }>, reply: FastifyReply) {
    try {
      const year = request.query.year ?? new Date().getFullYear()
      const chartData = await this.useCase.execute(request.user.id, year)
      return reply.status(200).send({ chartData })
    } catch (err) {
      request.log.error(err)
      return reply.status(500).send({ message: 'Falha ao obter tendência de despesas' })
    }
  }
}
