import { z } from 'zod'

type GetDebtsTrendQuery = {
  year?: number
}

const GetDebtsTrendResponse = z.object({
  chartData: z.array(z.record(z.string(), z.union([z.string(), z.number()]))),
})

export type GetDebtsTrendResponse = z.infer<typeof GetDebtsTrendResponse>

export async function getDebtsTrend({ year }: GetDebtsTrendQuery) {
  const url = new URL('http://localhost:3333/api/debts/trend')

  if (year) url.searchParams.set('year', year.toString())

  const response = await fetch(url, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Falha ao buscar os dados evolutivos das dívidas.')
  }

  const data = await response.json()

  return GetDebtsTrendResponse.parse(data)
}
