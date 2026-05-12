import { apiRequest } from '@/lib/api-client'

export type UpdateCardRequest = {
  id: string
  limit: number
  closingOffsetDays: number
  dueDay: number
}

export async function updateCard({ id, limit, closingOffsetDays, dueDay }: UpdateCardRequest) {
  await apiRequest(`/api/cards/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ limit, closingOffsetDays, dueDay }),
  })
}
