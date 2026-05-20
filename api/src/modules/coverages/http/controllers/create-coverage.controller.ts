import type { FastifyBaseLogger, FastifyReply } from 'fastify'

import { CoverageForPastPeriodError } from '@/modules/coverages/domain/errors/coverages.errors'
import type { CreateCoverageInput } from '@/modules/coverages/http/dto/coverages.dto'
import type { CreateCoverageUseCase } from '@/modules/coverages/application/use-cases/create-coverage/create-coverage.use-case'

export class CreateCoverageController {
  constructor(private readonly useCase: CreateCoverageUseCase) {}

  async handle(
    memberId: string,
    cardId: string,
    body: CreateCoverageInput,
    reply: FastifyReply,
    log: FastifyBaseLogger,
  ) {
    try {
      const coverage = await this.useCase.execute(memberId, cardId, body)
      return reply.status(201).send({
        coverage: { ...coverage, remaining: coverage.amount },
        message: 'Cobertura registrada com sucesso!',
      })
    } catch (err) {
      if (err instanceof CoverageForPastPeriodError) {
        return reply.status(422).send({ message: err.message })
      }
      log.error(err)
      return reply.status(500).send({ message: 'Falha ao registrar cobertura' })
    }
  }
}
