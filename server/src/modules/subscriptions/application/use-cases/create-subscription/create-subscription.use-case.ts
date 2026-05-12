import {
  SubscriptionCardNotFoundError,
  SubscriptionMemberNotFoundError,
} from '@/modules/subscriptions/domain/errors/subscriptions.errors'
import type {
  ISubscriptionsRepository,
  Subscription,
} from '@/modules/subscriptions/domain/repositories/subscriptions.repository.interface'
import type { CreateSubscriptionInput } from '@/modules/subscriptions/http/dto/subscriptions.dto'

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
