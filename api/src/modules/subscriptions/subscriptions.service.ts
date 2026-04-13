import type { CreateSubscriptionInput, UpdateSubscriptionInput } from '@/modules/subscriptions/subscriptions.dto'
import {
  SubscriptionCardNotFoundError,
  SubscriptionMemberNotFoundError,
  SubscriptionNotFoundError,
} from '@/modules/subscriptions/subscriptions.errors'
import type { ISubscriptionsRepository, Subscription, SubscriptionRow } from '@/modules/subscriptions/subscriptions.repository.interface'

export class SubscriptionsService {
  constructor(private readonly repo: ISubscriptionsRepository) {}

  async create(userId: string, data: CreateSubscriptionInput): Promise<Subscription> {
    const card = await this.repo.findCardByOwner(data.cardId, userId)
    if (!card) throw new SubscriptionCardNotFoundError()

    const member = await this.repo.findActiveMemberById(data.memberId)
    if (!member) throw new SubscriptionMemberNotFoundError()

    return this.repo.create({ ...data, userId })
  }

  async findAll(userId: string): Promise<SubscriptionRow[]> {
    return this.repo.findAll(userId)
  }

  async update(id: string, userId: string, data: UpdateSubscriptionInput): Promise<void> {
    const sub = await this.repo.findById(id, userId)
    if (!sub) throw new SubscriptionNotFoundError()

    if (data.cardId) {
      const card = await this.repo.findCardByOwner(data.cardId, userId)
      if (!card) throw new SubscriptionCardNotFoundError()
    }

    await this.repo.update(id, data)
  }

  async deactivate(id: string, userId: string): Promise<void> {
    const sub = await this.repo.findById(id, userId)
    if (!sub) throw new SubscriptionNotFoundError()
    await this.repo.deactivate(id)
  }
}
