import { z } from 'zod'

type GetCardParams = {
  id: string
}

const GetCardResponse = z.object({
  card: z.object({
    name: z.string(),
    limit: z.coerce.number(),
    closingOffsetDays: z.coerce.number(),
    dueDay: z.coerce.number(),
  }),
})

export async function getCard({ id }: GetCardParams) {
  const response = await fetch(`http://localhost:3333/api/cards/${id}`, {
    credentials: 'include',
  })

  if (!response.ok) throw new Error('Failed to request card by id.')

  const data = await response.json()

  return GetCardResponse.parse(data)
}
