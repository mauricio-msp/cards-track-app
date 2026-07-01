import { apiRequest } from '@/lib/api-client'

type CreateCardRequest = {
  name: string
  limit: number
  closingOffsetDays: number
  dueDay: number
  anticipationMode: 'none' | 'gap' | 'tail'
}

export async function createCard({
  name,
  limit,
  closingOffsetDays,
  dueDay,
  anticipationMode,
}: CreateCardRequest) {
  await apiRequest('/api/cards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, limit, closingOffsetDays, dueDay, anticipationMode }),
  })
}
