import { z } from 'zod'
import { apiRequest } from '@/lib/api-client'

type GetCardParams = {
  id: string
}

const GetCardResponse = z.object({
  card: z.object({
    name: z.string(),
    limit: z.coerce.number(),
    closingOffsetDays: z.coerce.number(),
    dueDay: z.coerce.number(),
    anticipationMode: z.enum(['none', 'gap', 'tail']),
  }),
})

export async function getCard({ id }: GetCardParams) {
  const data = await apiRequest(`/api/cards/${id}`)
  return GetCardResponse.parse(data)
}
