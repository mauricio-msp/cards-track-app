import { PurchaseNotFoundError } from '@/modules/purchases/domain/errors/purchases.errors'
import type { IPurchasesRepository } from '@/modules/purchases/domain/repositories/purchases.repository.interface'

export class DeletePurchaseUseCase {
  constructor(private readonly repo: IPurchasesRepository) {}

  async execute(pmId: string, userId: string): Promise<void> {
    const target = await this.repo.findPurchaseMemberByIdAndOwner(pmId, userId)
    if (!target) throw new PurchaseNotFoundError()
    await this.repo.deletePurchase(target.purchaseId)
  }
}
