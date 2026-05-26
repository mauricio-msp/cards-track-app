import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { GetCoveragesUseCase } from '@/modules/coverages/application/use-cases/get-coverages/get-coverages.use-case'
import type { CoveragePeriodQuery } from '@/modules/coverages/http/dto/coverages.dto'

export class GetCoveragesController {
  constructor(private readonly useCase: GetCoveragesUseCase) {}

  async handle(
    memberId: string,
    cardId: string,
    query: CoveragePeriodQuery,
    reply: FastifyReply,
    log: FastifyBaseLogger,
  ) {
    try {
      const result = await this.useCase.execute(memberId, cardId, query.month, query.year)
      return reply.status(200).send(result)
    } catch (err) {
      log.error(err)
      return reply.status(500).send({ message: 'Falha ao buscar coberturas' })
    }
  }
}
