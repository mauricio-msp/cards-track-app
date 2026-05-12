import { apiRequest } from '@/lib/api-client'

export type CreateSubscriptionRequest = {
  cardId: string
  memberId: string
  name: string
  amount: number
  billingDay: number
}

export async function createSubscription(data: CreateSubscriptionRequest) {
  await apiRequest('/api/subscriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}
