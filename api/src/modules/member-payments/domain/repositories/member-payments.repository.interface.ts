export type MemberPayment = {
  id: string
  memberId: string
  cardId: string
  targetMonth: number
  targetYear: number
  amount: number
  paidAt: Date
  description: string
  createdAt: Date
}

export type CreateMemberPaymentData = {
  memberId: string
  cardId: string
  targetMonth: number
  targetYear: number
  amount: number
  paidAt: Date
  description: string
}

export type UpdateMemberPaymentData = {
  amount?: number
  paidAt?: Date
  description?: string
}

export interface IMemberPaymentsRepository {
  findByPeriod(
    memberId: string,
    cardId: string,
    targetMonth: number,
    targetYear: number,
  ): Promise<MemberPayment[]>

  findInstallmentsTotalByPeriod(
    memberId: string,
    cardId: string,
    targetMonth: number,
    targetYear: number,
  ): Promise<number>

  findById(id: string): Promise<MemberPayment | null>

  create(data: CreateMemberPaymentData): Promise<MemberPayment>

  update(id: string, data: UpdateMemberPaymentData): Promise<MemberPayment>

  delete(id: string): Promise<void>
}
