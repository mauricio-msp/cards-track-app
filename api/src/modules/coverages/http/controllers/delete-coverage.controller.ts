import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { DeleteCoverageUseCase } from '@/modules/coverages/application/use-cases/delete-coverage/delete-coverage.use-case'
import { CoverageNotFoundError } from '@/modules/coverages/domain/errors/coverages.errors'

export class DeleteCoverageController {
  constructor(private readonly useCase: DeleteCoverageUseCase) {}

  async handle(coverageId: string, reply: FastifyReply, log: FastifyBaseLogger) {
    try {
      await this.useCase.execute(coverageId)
      return reply.status(200).send({ message: 'Cobertura removida com sucesso!' })
    } catch (err) {
      if (err instanceof CoverageNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }
      log.error(err)
      return reply.status(500).send({ message: 'Falha ao remover cobertura' })
    }
  }
}
