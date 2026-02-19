import { z } from 'zod'

type GetMonthTotalAmountCardParams = {
  id: string
}
type GetMonthTotalAmountCardQuery = {
  month?: number
  year?: number
}

const GetMonthTotalAmountCardResponse = z.object({
  totalAmountMonth: z.coerce.number(),
})

export async function getMonthTotalAmountCard({
  id,
  month,
  year,
}: GetMonthTotalAmountCardParams & GetMonthTotalAmountCardQuery) {
  const url = new URL(`http://localhost:3333/api/cards/${id}/month-total-amount`)

  if (year?.toString()) url.searchParams.set('year', String(year))
  if (month?.toString()) url.searchParams.set('month', String(month))

  const response = await fetch(url, {
    credentials: 'include',
  })

  if (!response.ok) throw new Error('Failed to request month total amount card.')

  const data = await response.json()

  return GetMonthTotalAmountCardResponse.parse(data)
}
