import type {
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
} from '@/modules/subscriptions/http/dto/subscriptions.dto'

export type Subscription = {
  id: string
  name: string
  amount: number
  billingDay: number
  cardId: string
  memberId: string
  active: boolean
  createdAt: Date
}

export type SubscriptionRow = {
  id: string
  name: string
  amount: number
  billingDay: number
  active: boolean
  cardId: string
  cardName: string
  memberId: string
  memberName: string
  createdAt: Date
}

export interface ISubscriptionsRepository {
  findCardByOwner(cardId: string, userId: string): Promise<{ id: string } | null>
  findActiveMemberById(memberId: string): Promise<{ id: string } | null>
  findById(id: string, userId: string): Promise<{ id: string } | null>
  findAll(userId: string): Promise<SubscriptionRow[]>
  create(data: CreateSubscriptionInput & { userId: string }): Promise<Subscription>
  update(id: string, data: UpdateSubscriptionInput): Promise<void>
  deactivate(id: string): Promise<void>
}
