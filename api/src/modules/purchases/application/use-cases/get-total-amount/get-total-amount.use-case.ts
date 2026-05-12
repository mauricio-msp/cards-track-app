import type { IPurchasesRepository } from '@/modules/purchases/domain/repositories/purchases.repository.interface'

export class GetTotalAmountUseCase {
  constructor(private readonly repo: IPurchasesRepository) {}

  async execute(userId: string): Promise<number> {
    return this.repo.getTotalAmount(userId)
  }
}
