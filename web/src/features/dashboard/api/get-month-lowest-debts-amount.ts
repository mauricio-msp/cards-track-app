import { z } from 'zod'

const MonthLowestDebtsAmountResponse = z.object({
  amount: z.coerce.number(),
  cards: z.array(
    z.object({
      cardId: z.string(),
      cardName: z.string(),
      total: z.coerce.number(),
    }),
  ),
})

export async function getMonthLowestDebtsAmount() {
  const response = await fetch('http://localhost:3333/api/month-lowest-debts-amount', {
    credentials: 'include',
  })

  if (!response.ok) throw Error('Falha ao solicitar o menor valor de dívidas de todos os cartões')

  const data = await response.json()

  return MonthLowestDebtsAmountResponse.parse(data)
}
