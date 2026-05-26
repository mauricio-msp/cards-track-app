import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { UpdateCoverageRepaymentUseCase } from '@/modules/coverages/application/use-cases/update-coverage-repayment/update-coverage-repayment.use-case'
import { CoverageNotFoundError, InvalidRepaymentAmountError } from '@/modules/coverages/domain/errors/coverages.errors'
import type { UpdateCoverageRepaymentInput } from '@/modules/coverages/http/dto/coverages.dto'

export class UpdateCoverageRepaymentController {
  constructor(private readonly useCase: UpdateCoverageRepaymentUseCase) {}

  async handle(
    coverageId: string,
    body: UpdateCoverageRepaymentInput,
    reply: FastifyReply,
    log: FastifyBaseLogger,
  ) {
    try {
      const coverage = await this.useCase.execute(coverageId, body)
      return reply.status(200).send({
        coverage: { ...coverage, remaining: Math.max(coverage.amount - coverage.amountRepaid, 0) },
        message: 'Quitação atualizada com sucesso!',
      })
    } catch (err) {
      if (err instanceof CoverageNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }
      if (err instanceof InvalidRepaymentAmountError) {
        return reply.status(422).send({ message: err.message })
      }
      log.error(err)
      return reply.status(500).send({ message: 'Falha ao atualizar quitação' })
    }
  }
}
