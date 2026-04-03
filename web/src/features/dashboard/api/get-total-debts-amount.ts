import { z } from 'zod'

const TotalDebtsAmountResponse = z.object({
  totalAmount: z.coerce.number(),
})

export async function getTotalDebtsAmount() {
  const response = await fetch('http://localhost:3333/api/total-debts-amount', {
    credentials: 'include',
  })

  if (!response.ok) throw Error('Falha ao solicitar o valor total de dívidas de todos os cartões.')

  const data = await response.json()

  return TotalDebtsAmountResponse.parse(data)
}
