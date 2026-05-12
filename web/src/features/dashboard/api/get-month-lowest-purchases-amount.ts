import { z } from 'zod'

const MonthLowestPurchasesAmountResponse = z.object({
  amount: z.coerce.number(),
  cards: z.array(
    z.object({
      cardId: z.string(),
      cardName: z.string(),
      total: z.coerce.number(),
    }),
  ),
})

export async function getMonthLowestPurchasesAmount() {
  const response = await fetch('http://localhost:3333/api/metrics/month-lowest-amount', {
    credentials: 'include',
  })

  if (!response.ok) throw Error('Falha ao solicitar o menor valor de dívidas de todos os cartões')

  const data = await response.json()

  return MonthLowestPurchasesAmountResponse.parse(data)
}
