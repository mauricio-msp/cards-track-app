import type { Coverage, ICoveragesRepository } from '@/modules/coverages/domain/repositories/coverages.repository.interface'

export type CoverageWithRemaining = Coverage & { remaining: number }

export type GetCoveragesResult = {
  coverages: CoverageWithRemaining[]
  totalCovered: number
  totalRepaid: number
  totalRemaining: number
}

export class GetCoveragesUseCase {
  constructor(private readonly repo: ICoveragesRepository) {}

  async execute(
    memberId: string,
    cardId: string,
    targetMonth: number,
    targetYear: number,
  ): Promise<GetCoveragesResult> {
    const coverages = await this.repo.findByPeriod(memberId, cardId, targetMonth, targetYear)

    const coveragesWithRemaining: CoverageWithRemaining[] = coverages.map(c => ({
      ...c,
      remaining: Math.max(c.amount - c.amountRepaid, 0),
    }))

    const totalCovered = coverages.reduce((sum, c) => sum + c.amount, 0)
    const totalRepaid = coverages.reduce((sum, c) => sum + c.amountRepaid, 0)
    const totalRemaining = Math.max(totalCovered - totalRepaid, 0)

    return { coverages: coveragesWithRemaining, totalCovered, totalRepaid, totalRemaining }
  }
}
