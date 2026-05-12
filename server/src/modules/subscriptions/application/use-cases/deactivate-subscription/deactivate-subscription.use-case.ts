import { SubscriptionNotFoundError } from '@/modules/subscriptions/domain/errors/subscriptions.errors'
import type { ISubscriptionsRepository } from '@/modules/subscriptions/domain/repositories/subscriptions.repository.interface'

export class DeactivateSubscriptionUseCase {
  constructor(private readonly repo: ISubscriptionsRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const sub = await this.repo.findById(id, userId)
    if (!sub) throw new SubscriptionNotFoundError()
    await this.repo.deactivate(id)
  }
}
