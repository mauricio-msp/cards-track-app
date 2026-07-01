import { z } from 'zod'
import { apiRequest } from '@/lib/api-client'

export const CreditCardSchema = z.object({
  id: z.string(),
  name: z.string(),
  limit: z.coerce.number(),
  closingOffsetDays: z.coerce.number(),
  dueDay: z.coerce.number(),
  anticipationMode: z.enum(['none', 'gap', 'tail']),
})

export const CreditCardListResponse = z.object({
  cards: z.array(CreditCardSchema),
})

export async function getCards() {
  const data = await apiRequest('/api/cards')
  return CreditCardListResponse.parse(data)
}
