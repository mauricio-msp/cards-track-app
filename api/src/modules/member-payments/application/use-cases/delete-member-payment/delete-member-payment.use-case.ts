import { MemberPaymentNotFoundError } from '@/modules/member-payments/domain/errors/member-payments.errors'
import type { IMemberPaymentsRepository } from '@/modules/member-payments/domain/repositories/member-payments.repository.interface'

export class DeleteMemberPaymentUseCase {
  constructor(private readonly repo: IMemberPaymentsRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new MemberPaymentNotFoundError()

    await this.repo.delete(id)
  }
}
