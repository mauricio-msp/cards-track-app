import { z } from 'zod'
import { apiRequest, apiUrl } from '@/lib/api-client'

type GetMonthTotalAmountCardParams = {
  id: string
}
type GetMonthTotalAmountCardQuery = {
  month?: number
  year?: number
}

const GetMonthTotalAmountCardResponse = z.object({
  totalAmountMonth: z.coerce.number(),
})

export async function getMonthTotalAmountCard({
  id,
  month,
  year,
}: GetMonthTotalAmountCardParams & GetMonthTotalAmountCardQuery) {
  const url = apiUrl(`/api/cards/${id}/month-total-amount`)
  if (year !== undefined) url.searchParams.set('year', String(year))
  if (month !== undefined) url.searchParams.set('month', String(month))
  const data = await apiRequest(url)
  return GetMonthTotalAmountCardResponse.parse(data)
}
