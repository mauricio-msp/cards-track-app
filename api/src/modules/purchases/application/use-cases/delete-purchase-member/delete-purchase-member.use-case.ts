import { PurchaseNotFoundError } from '@/modules/purchases/domain/errors/purchases.errors'
import type { IPurchasesRepository } from '@/modules/purchases/domain/repositories/purchases.repository.interface'

export class DeletePurchaseMemberUseCase {
  constructor(private readonly repo: IPurchasesRepository) {}

  async execute(pmId: string, memberId: string, userId: string): Promise<void> {
    const target = await this.repo.findPurchaseMemberByIdMemberAndOwner(pmId, memberId, userId)
    if (!target) throw new PurchaseNotFoundError()
    await this.repo.deletePurchaseMember(target.id)
  }
}
