import type { IPurchasesRepository } from '@/modules/purchases/domain/repositories/purchases.repository.interface'

export class GetMonthTotalAmountUseCase {
  constructor(private readonly repo: IPurchasesRepository) {}

  async execute(userId: string): Promise<number> {
    const now = new Date()
    return this.repo.getMonthTotalAmount(userId, now.getMonth(), now.getFullYear(), now.getDate())
  }
}
