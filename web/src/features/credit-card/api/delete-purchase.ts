import { apiRequest } from '@/lib/api-client'

export async function deletePurchase(pmId: string) {
  await apiRequest(`/api/purchases/${pmId}`, { method: 'DELETE' })
}
