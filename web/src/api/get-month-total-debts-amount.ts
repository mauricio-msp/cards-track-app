import { z } from 'zod'

const MonthTotalDebtsAmountResponse = z.object({
  totalAmount: z.coerce.number(),
})

export async function getMonthTotalDebtsAmount() {
  const response = await fetch('http://localhost:3333/api/month-total-debts-amount', {
    credentials: 'include',
  })

  if (!response.ok) throw Error('Failed to request total amount all credit cards of current month.')

  const data = await response.json()

  return MonthTotalDebtsAmountResponse.parse(data)
}
