import { z } from 'zod'

type GetTotalAmountCardParams = {
  id: string
}

const GetTotalAmountCardResponse = z.object({
  totalAmountCard: z.coerce.number(),
})

export async function getTotalAmountCard({ id }: GetTotalAmountCardParams) {
  const response = await fetch(`http://localhost:3333/api/cards/${id}/total-amount`, {
    credentials: 'include',
  })

  if (!response.ok) throw new Error('Failed to request total amount card.')

  const data = await response.json()

  return GetTotalAmountCardResponse.parse(data)
}
