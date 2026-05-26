import { CoverageNotFoundError, InvalidRepaymentAmountError } from '@/modules/coverages/domain/errors/coverages.errors'
import type { Coverage, ICoveragesRepository } from '@/modules/coverages/domain/repositories/coverages.repository.interface'
import type { UpdateCoverageRepaymentInput } from '@/modules/coverages/http/dto/coverages.dto'

export class UpdateCoverageRepaymentUseCase {
  constructor(private readonly repo: ICoveragesRepository) {}

  async execute(id: string, data: UpdateCoverageRepaymentInput): Promise<Coverage> {
    const coverage = await this.repo.findById(id)
    if (!coverage) throw new CoverageNotFoundError()

    if (data.settled) {
      return this.repo.updateRepayment(id, {
        amountRepaid: coverage.amount,
        settledAt: new Date(),
      })
    }

    const amountRepaid = data.amountRepaid ?? 0
    if (amountRepaid > coverage.amount) throw new InvalidRepaymentAmountError()

    return this.repo.updateRepayment(id, {
      amountRepaid,
      settledAt: null,
    })
  }
}
