import { InstallmentNotFoundError } from '@/modules/installments/domain/errors/installments.errors'
import type { IInstallmentsRepository } from '@/modules/installments/domain/repositories/installments.repository.interface'

export class UnpayInstallmentUseCase {
  constructor(private readonly repo: IInstallmentsRepository) {}

  async execute(installmentId: string, userId: string): Promise<void> {
    const existing = await this.repo.findPaidByIdAndOwner(installmentId, userId)
    if (!existing) throw new InstallmentNotFoundError('Parcela não encontrada ou já está pendente!')
    await this.repo.markAsUnpaid(installmentId)
  }
}
