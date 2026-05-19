import { MemberPaymentNotFoundError } from '@/modules/member-payments/domain/errors/member-payments.errors'
import type { IMemberPaymentsRepository, MemberPayment } from '@/modules/member-payments/domain/repositories/member-payments.repository.interface'
import type { UpdateMemberPaymentInput } from '@/modules/member-payments/http/dto/member-payments.dto'

export class UpdateMemberPaymentUseCase {
  constructor(private readonly repo: IMemberPaymentsRepository) {}

  async execute(id: string, data: UpdateMemberPaymentInput): Promise<MemberPayment> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new MemberPaymentNotFoundError()

    return this.repo.update(id, {
      amount: data.amount,
      paidAt: data.paidAt ? new Date(data.paidAt) : undefined,
      description: data.description,
    })
  }
}
