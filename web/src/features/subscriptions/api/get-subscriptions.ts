import { z } from 'zod'
import { apiRequest } from '@/lib/api-client'

export const SubscriptionItem = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number(),
  billingDay: z.number(),
  active: z.boolean(),
  cardId: z.string(),
  cardName: z.string(),
  memberId: z.string(),
  memberName: z.string(),
  createdAt: z.string(),
})

const GetSubscriptionsResponse = z.object({
  subscriptions: z.array(SubscriptionItem),
})

export async function getSubscriptions() {
  const data = await apiRequest('/api/subscriptions')
  return GetSubscriptionsResponse.parse(data)
}
