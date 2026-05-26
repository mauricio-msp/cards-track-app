export type Coverage = {
  id: string
  memberId: string
  cardId: string
  targetMonth: number
  targetYear: number
  amount: number
  coveredAt: Date
  description: string | null
  amountRepaid: number
  settledAt: Date | null
  createdAt: Date
}

export type CoverageWithMember = {
  id: string
  memberId: string
  memberName: string
  cardId: string
  cardName: string
  targetMonth: number
  targetYear: number
  amount: number
  amountRepaid: number
  settledAt: Date | null
}

export type CreateCoverageData = {
  memberId: string
  cardId: string
  targetMonth: number
  targetYear: number
  amount: number
  coveredAt: Date
  description?: string
}

export type UpdateCoverageRepaymentData = {
  amountRepaid: number
  settledAt: Date | null
}

export interface ICoveragesRepository {
  findByPeriod(
    memberId: string,
    cardId: string,
    targetMonth: number,
    targetYear: number,
  ): Promise<Coverage[]>

  findAllByUser(
    userId: string,
    month?: number,
    year?: number,
  ): Promise<CoverageWithMember[]>

  findById(id: string): Promise<Coverage | null>

  create(data: CreateCoverageData): Promise<Coverage>

  updateRepayment(id: string, data: UpdateCoverageRepaymentData): Promise<Coverage>

  delete(id: string): Promise<void>
}
