import type { CreateSubscriptionInput } from '@/modules/subscriptions/subscriptions.dto'
import {
  SubscriptionCardNotFoundError,
  SubscriptionMemberNotFoundError,
} from '@/modules/subscriptions/subscriptions.errors'
import type { ISubscriptionsRepository, Subscription } from '@/modules/subscriptions/subscriptions.repository.interface'

export class CreateSubscriptionUseCase {
  constructor(private readonly repo: ISubscriptionsRepository) {}

  async execute(userId: string, data: CreateSubscriptionInput): Promise<Subscription> {
    const card = await this.repo.findCardByOwner(data.cardId, userId)
    if (!card) throw new SubscriptionCardNotFoundError()

    const member = await this.repo.findActiveMemberById(data.memberId)
    if (!member) throw new SubscriptionMemberNotFoundError()

    return this.repo.create({ ...data, userId })
  }
}
