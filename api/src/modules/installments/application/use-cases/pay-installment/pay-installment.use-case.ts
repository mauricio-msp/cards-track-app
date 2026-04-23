import { InstallmentNotFoundError } from '@/modules/installments/domain/errors/installments.errors'
import type { IInstallmentsRepository } from '@/modules/installments/domain/repositories/installments.repository.interface'

export class PayInstallmentUseCase {
  constructor(private readonly repo: IInstallmentsRepository) {}

  async execute(installmentId: string, userId: string): Promise<{ installmentId: string; paidAt: string }> {
    const existing = await this.repo.findByIdAndOwner(installmentId, userId)
    if (!existing) throw new InstallmentNotFoundError()
    const paidAt = await this.repo.markAsPaid(installmentId)
    return { installmentId, paidAt: paidAt.toISOString() }
  }
}
