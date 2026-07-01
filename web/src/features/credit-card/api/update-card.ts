import { apiRequest } from '@/lib/api-client'

export type UpdateCardRequest = {
  id: string
  limit: number
  closingOffsetDays: number
  dueDay: number
  anticipationMode?: 'none' | 'gap' | 'tail'
}

export async function updateCard({
  id,
  limit,
  closingOffsetDays,
  dueDay,
  anticipationMode,
}: UpdateCardRequest) {
  await apiRequest(`/api/cards/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ limit, closingOffsetDays, dueDay, anticipationMode }),
  })
}
