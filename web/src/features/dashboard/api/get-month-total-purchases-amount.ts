import { z } from 'zod'

const MonthTotalPurchasesAmountResponse = z.object({
  totalAmount: z.coerce.number(),
})

export async function getMonthTotalPurchasesAmount() {
  const response = await fetch('http://localhost:3333/api/metrics/month-total-amount', {
    credentials: 'include',
  })

  if (!response.ok)
    throw Error('Falha ao solicitar o valor total de dívidas de todos os cartões do mês atual.')

  const data = await response.json()

  return MonthTotalPurchasesAmountResponse.parse(data)
}
