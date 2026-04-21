import type { IDebtsRepository } from '@/modules/debts/debts.repository.interface'

export class GetTotalDebtsAmountUseCase {
  constructor(private readonly repo: IDebtsRepository) {}

  async execute(userId: string): Promise<number> {
    return this.repo.getTotalDebtsAmount(userId)
  }
}
