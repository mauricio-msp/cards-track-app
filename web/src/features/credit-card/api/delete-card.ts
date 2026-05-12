import { apiRequest } from '@/lib/api-client'

export async function deleteCard(cardId: string) {
  await apiRequest(`/api/cards/${cardId}`, { method: 'DELETE' })
}
