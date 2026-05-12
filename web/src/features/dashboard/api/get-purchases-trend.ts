import { z } from 'zod'

type GetPurchasesTrendQuery = {
  year?: number
}

const GetPurchasesTrendResponse = z.object({
  chartData: z.array(z.record(z.string(), z.union([z.string(), z.number()]))),
})

export type GetPurchasesTrendResponse = z.infer<typeof GetPurchasesTrendResponse>

export async function getPurchasesTrend({ year }: GetPurchasesTrendQuery) {
  const url = new URL('http://localhost:3333/api/purchases/trend')

  if (year) url.searchParams.set('year', year.toString())

  const response = await fetch(url, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Falha ao buscar os dados evolutivos das dívidas.')
  }

  const data = await response.json()

  return GetPurchasesTrendResponse.parse(data)
}
