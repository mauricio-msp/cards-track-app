import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { GetTrendUseCase } from '@/modules/metrics/application/use-cases/get-trend/get-trend.use-case'

export class GetTrendController {
  constructor(private readonly useCase: GetTrendUseCase) {}

  async handle(userId: string, year: number, reply: FastifyReply, log: FastifyBaseLogger) {
    try {
      const chartData = await this.useCase.execute(userId, year)
      return reply.send({ chartData })
    } catch (err) {
      log.error(err)
      return reply.status(500).send({ message: 'Falha ao buscar evolução de gastos' })
    }
  }
}
