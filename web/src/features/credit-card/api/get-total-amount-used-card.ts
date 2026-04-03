import { z } from 'zod'

type GetTotalAmountCardParams = {
  id: string
}

const GetTotalAmountCardResponse = z.object({
  totalAmountCard: z.coerce.number(),
})

export async function getTotalAmountUsedCard({ id }: GetTotalAmountCardParams) {
  const response = await fetch(`http://localhost:3333/api/cards/${id}/total-amount-used`, {
    credentials: 'include',
  })

  if (!response.ok) throw new Error('Erro ao solicitar o valor total utilizado do cartão.')

  const data = await response.json()

  return GetTotalAmountCardResponse.parse(data)
}
