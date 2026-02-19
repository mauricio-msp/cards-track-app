import { z } from 'zod'

type GetDebtsYearlyEvolutionQuery = {
  year?: number
}

const GetDebtsYearlyEvolutionResponse = z.object({
  chartData: z.array(z.record(z.string(), z.union([z.string(), z.number()]))),
})

export type GetDebtsYearlyEvolutionResponse = z.infer<typeof GetDebtsYearlyEvolutionResponse>

export async function getDebtsYearlyEvolution({ year }: GetDebtsYearlyEvolutionQuery) {
  const url = new URL('http://localhost:3333/api/debts/yearly-evolution')

  if (year) url.searchParams.set('year', year.toString())

  const response = await fetch(url, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Falha ao buscar os dados evolutivos das dívidas.')
  }

  const data = await response.json()

  return GetDebtsYearlyEvolutionResponse.parse(data)
}
