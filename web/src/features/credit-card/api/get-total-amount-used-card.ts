import { z } from 'zod'
import { apiRequest } from '@/lib/api-client'

type GetTotalAmountCardParams = {
  id: string
}

const GetTotalAmountCardResponse = z.object({
  totalAmountCard: z.coerce.number(),
})

export async function getTotalAmountUsedCard({ id }: GetTotalAmountCardParams) {
  const data = await apiRequest(`/api/cards/${id}/total-amount-used`)
  return GetTotalAmountCardResponse.parse(data)
}
