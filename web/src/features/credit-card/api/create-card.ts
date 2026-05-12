import { apiRequest } from '@/lib/api-client'

type CreateCardRequest = {
  name: string
  limit: number
  closingOffsetDays: number
  dueDay: number
}

export async function createCard({ name, limit, closingOffsetDays, dueDay }: CreateCardRequest) {
  await apiRequest('/api/cards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, limit, closingOffsetDays, dueDay }),
  })
}
