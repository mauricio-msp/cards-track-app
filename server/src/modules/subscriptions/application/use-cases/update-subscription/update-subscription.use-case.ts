import {
  SubscriptionCardNotFoundError,
  SubscriptionNotFoundError,
} from '@/modules/subscriptions/domain/errors/subscriptions.errors'
import type { ISubscriptionsRepository } from '@/modules/subscriptions/domain/repositories/subscriptions.repository.interface'
import type { UpdateSubscriptionInput } from '@/modules/subscriptions/http/dto/subscriptions.dto'

export class UpdateSubscriptionUseCase {
  constructor(private readonly repo: ISubscriptionsRepository) {}

  async execute(id: string, userId: string, data: UpdateSubscriptionInput): Promise<void> {
    const sub = await this.repo.findById(id, userId)
    if (!sub) throw new SubscriptionNotFoundError()

    if (data.cardId) {
      const card = await this.repo.findCardByOwner(data.cardId, userId)
      if (!card) throw new SubscriptionCardNotFoundError()
    }

    await this.repo.update(id, data)
  }
}
