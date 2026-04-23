import { DebtNotFoundError } from '@/modules/debts/domain/errors/debts.errors'
import type { IDebtsRepository } from '@/modules/debts/domain/repositories/debts.repository.interface'

export class DeleteDebtMemberUseCase {
  constructor(private readonly repo: IDebtsRepository) {}

  async execute(debtId: string, memberId: string, userId: string): Promise<void> {
    const target = await this.repo.findDebtByIdAndMemberAndOwner(debtId, memberId, userId)
    if (!target) throw new DebtNotFoundError()
    await this.repo.deleteById(target.id)
  }
}
