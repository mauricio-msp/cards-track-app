import { z } from 'zod'
import { apiRequest } from '@/lib/api-client'

const MonthLowestPurchasesAmountResponse = z.object({
  amount: z.coerce.number(),
  cards: z.array(z.object({ cardId: z.string(), cardName: z.string(), total: z.coerce.number() })),
})

export async function getMonthLowestPurchasesAmount() {
  const data = await apiRequest('/api/metrics/month-lowest-amount')
  return MonthLowestPurchasesAmountResponse.parse(data)
}
