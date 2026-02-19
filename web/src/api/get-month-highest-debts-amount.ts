import { z } from 'zod'

const MonthHighestDebtsAmountResponse = z.object({
  amount: z.coerce.number(),
  cards: z.array(
    z.object({
      cardId: z.string(),
      cardName: z.string(),
      total: z.coerce.number(),
    }),
  ),
})

export async function getMonthHighestDebtsAmount() {
  const response = await fetch('http://localhost:3333/api/month-highest-debts-amount', {
    credentials: 'include',
  })

  if (!response.ok) throw Error('Failed to request highest debts amount all cards')

  const data = await response.json()

  return MonthHighestDebtsAmountResponse.parse(data)
}
