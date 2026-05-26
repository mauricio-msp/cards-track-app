import type {
  CoverageWithMember,
  ICoveragesRepository,
} from '@/modules/coverages/domain/repositories/coverages.repository.interface'

export type CoverageWithMemberAndRemaining = CoverageWithMember & { remaining: number }

export type GetAllCoveragesResult = {
  coverages: CoverageWithMemberAndRemaining[]
  totalCovered: number
  totalRepaid: number
  totalRemaining: number
}

export class GetAllCoveragesUseCase {
  constructor(private readonly repo: ICoveragesRepository) {}

  async execute(userId: string, month?: number, year?: number): Promise<GetAllCoveragesResult> {
    const rows = await this.repo.findAllByUser(userId, month, year)

    const coverages: CoverageWithMemberAndRemaining[] = rows.map(c => ({
      ...c,
      remaining: Math.max(c.amount - c.amountRepaid, 0),
    }))

    const totalCovered = coverages.reduce((sum, c) => sum + c.amount, 0)
    const totalRepaid = coverages.reduce((sum, c) => sum + c.amountRepaid, 0)
    const totalRemaining = coverages.reduce((sum, c) => sum + c.remaining, 0)

    return { coverages, totalCovered, totalRepaid, totalRemaining }
  }
}
