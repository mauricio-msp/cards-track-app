import { z } from 'zod'

const MonthTotalDebtsAmountResponse = z.object({
  totalAmount: z.coerce.number(),
})

export async function getMonthTotalDebtsAmount() {
  const response = await fetch('http://localhost:3333/api/month-total-debts-amount', {
    credentials: 'include',
  })

  if (!response.ok)
    throw Error('Falha ao solicitar o valor total de dívidas de todos os cartões do mês atual.')

  const data = await response.json()

  return MonthTotalDebtsAmountResponse.parse(data)
}
