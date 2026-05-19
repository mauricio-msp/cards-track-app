import type { IMemberPaymentsRepository, MemberPayment } from '@/modules/member-payments/domain/repositories/member-payments.repository.interface'

export type GetMemberPaymentsResult = {
  payments: MemberPayment[]
  totalPaid: number
  remaining: number
}

export class GetMemberPaymentsUseCase {
  constructor(private readonly repo: IMemberPaymentsRepository) {}

  async execute(
    memberId: string,
    cardId: string,
    targetMonth: number,
    targetYear: number,
  ): Promise<GetMemberPaymentsResult> {
    const [payments, installmentsTotal] = await Promise.all([
      this.repo.findByPeriod(memberId, cardId, targetMonth, targetYear),
      this.repo.findInstallmentsTotalByPeriod(memberId, cardId, targetMonth, targetYear),
    ])

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
    const remaining = Math.max(installmentsTotal - totalPaid, 0)

    return { payments, totalPaid, remaining }
  }
}
