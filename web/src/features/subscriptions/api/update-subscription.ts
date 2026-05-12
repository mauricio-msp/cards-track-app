import { apiRequest } from '@/lib/api-client'

export type UpdateSubscriptionRequest = {
  id: string
  name?: string
  amount?: number
  billingDay?: number
  cardId?: string
  active?: boolean
}

export async function updateSubscription({ id, ...body }: UpdateSubscriptionRequest) {
  await apiRequest(`/api/subscriptions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
