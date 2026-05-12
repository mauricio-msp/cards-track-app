import { z } from 'zod'
import { apiRequest } from '@/lib/api-client'

const MonthTotalPurchasesAmountResponse = z.object({
  totalAmount: z.coerce.number(),
})

export async function getMonthTotalPurchasesAmount() {
  const data = await apiRequest('/api/metrics/month-total-amount')
  return MonthTotalPurchasesAmountResponse.parse(data)
}
