import { apiRequest } from '@/lib/api-client'

export async function deleteSubscription(id: string) {
  await apiRequest(`/api/subscriptions/${id}`, { method: 'DELETE' })
}
