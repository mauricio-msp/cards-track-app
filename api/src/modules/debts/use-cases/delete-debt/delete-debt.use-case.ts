import { DebtNotFoundError } from '@/modules/debts/debts.errors'
import type { IDebtsRepository } from '@/modules/debts/debts.repository.interface'

export class DeleteDebtUseCase {
  constructor(private readonly repo: IDebtsRepository) {}

  async execute(debtId: string, userId: string): Promise<void> {
    const target = await this.repo.findDebtGroupByIdAndOwner(debtId, userId)
    if (!target) throw new DebtNotFoundError()
    await this.repo.deleteByGroupId(target.groupId)
  }
}
