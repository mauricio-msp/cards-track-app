import { z } from 'zod'
import { apiRequest } from '@/lib/api-client'

const MonthHighestPurchasesAmountResponse = z.object({
  amount: z.coerce.number(),
  cards: z.array(z.object({ cardId: z.string(), cardName: z.string(), total: z.coerce.number() })),
})

export async function getMonthHighestPurchasesAmount() {
  const data = await apiRequest('/api/metrics/month-highest-amount')
  return MonthHighestPurchasesAmountResponse.parse(data)
}
