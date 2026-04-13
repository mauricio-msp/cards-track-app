import { InstallmentNotFoundError } from '@/modules/installments/installments.errors'
import type { IInstallmentsRepository } from '@/modules/installments/installments.repository.interface'

export class InstallmentsService {
  constructor(private readonly repo: IInstallmentsRepository) {}

  async pay(
    installmentId: string,
    userId: string,
  ): Promise<{ installmentId: string; paidAt: string }> {
    const existing = await this.repo.findByIdAndOwner(installmentId, userId)
    if (!existing) throw new InstallmentNotFoundError()
    const paidAt = await this.repo.markAsPaid(installmentId)
    return { installmentId, paidAt: paidAt.toISOString() }
  }

  async unpay(installmentId: string, userId: string): Promise<void> {
    const existing = await this.repo.findPaidByIdAndOwner(installmentId, userId)
    if (!existing) throw new InstallmentNotFoundError('Parcela não encontrada ou já está pendente!')
    await this.repo.markAsUnpaid(installmentId)
  }
}
