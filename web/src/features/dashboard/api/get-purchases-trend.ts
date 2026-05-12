import { z } from 'zod'
import { apiRequest, apiUrl } from '@/lib/api-client'

type GetPurchasesTrendQuery = {
  year?: number
}

const GetPurchasesTrendResponse = z.object({
  chartData: z.array(z.record(z.string(), z.union([z.string(), z.number()]))),
})

export type GetPurchasesTrendResponse = z.infer<typeof GetPurchasesTrendResponse>

export async function getPurchasesTrend({ year }: GetPurchasesTrendQuery) {
  const url = apiUrl('/api/metrics/trend')
  if (year !== undefined) url.searchParams.set('year', year.toString())
  const data = await apiRequest(url)
  return GetPurchasesTrendResponse.parse(data)
}
