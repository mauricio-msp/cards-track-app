import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { GetAllCoveragesUseCase } from '@/modules/coverages/application/use-cases/get-all-coverages/get-all-coverages.use-case'
import type { AllCoveragesQuery } from '@/modules/coverages/http/dto/coverages.dto'

export class GetAllCoveragesController {
  constructor(private readonly useCase: GetAllCoveragesUseCase) {}

  async handle(
    userId: string,
    query: AllCoveragesQuery,
    reply: FastifyReply,
    log: FastifyBaseLogger,
  ) {
    try {
      const result = await this.useCase.execute(userId, query.month, query.year)
      return reply.status(200).send(result)
    } catch (err) {
      log.error(err)
      return reply.status(500).send({ message: 'Falha ao buscar coberturas' })
    }
  }
}
