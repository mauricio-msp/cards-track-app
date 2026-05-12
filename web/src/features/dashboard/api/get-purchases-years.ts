import { z } from 'zod'
import { apiRequest } from '@/lib/api-client'

const GetPurchasesYearsResponse = z.object({
  years: z.array(z.number()),
})

export async function getPurchasesYears() {
  const data = await apiRequest('/api/metrics/years')
  return GetPurchasesYearsResponse.parse(data)
}
