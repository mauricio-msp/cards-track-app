import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { GetYearsUseCase } from '@/modules/metrics/application/use-cases/get-years/get-years.use-case'

export class GetYearsController {
  constructor(private readonly useCase: GetYearsUseCase) {}

  async handle(userId: string, reply: FastifyReply, log: FastifyBaseLogger) {
    try {
      const years = await this.useCase.execute(userId)
      return reply.send({ years })
    } catch (err) {
      log.error(err)
      return reply.status(500).send({ message: 'Falha ao buscar anos disponíveis' })
    }
  }
}
