import { z } from 'zod'
import { apiRequest } from '@/lib/api-client'

const TotalPurchasesAmountResponse = z.object({
  totalAmount: z.coerce.number(),
})

export async function getTotalPurchasesAmount() {
  const data = await apiRequest('/api/metrics/total-amount')
  return TotalPurchasesAmountResponse.parse(data)
}
