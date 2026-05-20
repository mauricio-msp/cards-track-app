import { CoverageForPastPeriodError } from '@/modules/coverages/domain/errors/coverages.errors'
import type { Coverage, ICoveragesRepository } from '@/modules/coverages/domain/repositories/coverages.repository.interface'
import type { CreateCoverageInput } from '@/modules/coverages/http/dto/coverages.dto'

export class CreateCoverageUseCase {
  constructor(private readonly repo: ICoveragesRepository) {}

  async execute(memberId: string, cardId: string, data: CreateCoverageInput): Promise<Coverage> {
    const now = new Date()
    if (
      data.targetYear < now.getFullYear() ||
      (data.targetYear === now.getFullYear() && data.targetMonth < now.getMonth())
    ) {
      throw new CoverageForPastPeriodError()
    }

    return this.repo.create({
      memberId,
      cardId,
      targetMonth: data.targetMonth,
      targetYear: data.targetYear,
      amount: data.amount,
      coveredAt: new Date(data.coveredAt),
      description: data.description,
    })
  }
}
