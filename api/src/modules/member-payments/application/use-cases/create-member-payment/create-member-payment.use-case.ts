import type { IMemberPaymentsRepository, MemberPayment } from '@/modules/member-payments/domain/repositories/member-payments.repository.interface'
import type { CreateMemberPaymentInput } from '@/modules/member-payments/http/dto/member-payments.dto'

export class CreateMemberPaymentUseCase {
  constructor(private readonly repo: IMemberPaymentsRepository) {}

  async execute(
    memberId: string,
    cardId: string,
    data: CreateMemberPaymentInput,
  ): Promise<MemberPayment> {
    return this.repo.create({
      memberId,
      cardId,
      targetMonth: data.targetMonth,
      targetYear: data.targetYear,
      amount: data.amount,
      paidAt: new Date(data.paidAt),
      description: data.description,
    })
  }
}
