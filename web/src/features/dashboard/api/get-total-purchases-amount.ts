import { z } from 'zod'

const TotalPurchasesAmountResponse = z.object({
  totalAmount: z.coerce.number(),
})

export async function getTotalPurchasesAmount() {
  const response = await fetch('http://localhost:3333/api/metrics/total-amount', {
    credentials: 'include',
  })

  if (!response.ok) throw Error('Falha ao solicitar o valor total de dívidas de todos os cartões.')

  const data = await response.json()

  return TotalPurchasesAmountResponse.parse(data)
}
