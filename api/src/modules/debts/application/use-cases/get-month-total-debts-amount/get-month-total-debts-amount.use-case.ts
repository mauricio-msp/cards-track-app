import type { IDebtsRepository } from '@/modules/debts/domain/repositories/debts.repository.interface'

export class GetMonthTotalDebtsAmountUseCase {
  constructor(private readonly repo: IDebtsRepository) {}

  async execute(userId: string): Promise<number> {
    const now = new Date()
    return this.repo.getMonthTotalDebtsAmount(
      userId,
      now.getMonth(),
      now.getFullYear(),
      now.getDate(),
    )
  }
}
