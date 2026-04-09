import { z } from 'zod'

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
  const response = await fetch('http://localhost:3333/api/subscriptions', {
    credentials: 'include',
  })

  if (!response.ok) throw new Error('Erro ao buscar assinaturas')

  const data = await response.json()
  return GetSubscriptionsResponse.parse(data)
}
