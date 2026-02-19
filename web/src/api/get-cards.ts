import { z } from 'zod'

export const CreditCardSchema = z.object({
  id: z.string(),
  name: z.string(),
  limit: z.coerce.number(),
  closingOffsetDays: z.coerce.number(),
  dueDay: z.coerce.number(),
})

export const CreditCardListResponse = z.object({
  cards: z.array(CreditCardSchema.omit({ closingOffsetDays: true, dueDay: true })),
})

export async function getCards() {
  const response = await fetch('http://localhost:3333/api/cards', {
    credentials: 'include',
  })

  if (!response.ok) throw Error('Failed to request credit cards.')

  const datas = await response.json()

  return CreditCardListResponse.parse(datas)
}
