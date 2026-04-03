import { z } from 'zod'

const GetDebtsYearsResponse = z.object({
  years: z.array(z.number()),
})

export async function getDebtsYears() {
  const response = await fetch('http://localhost:3333/api/debts/years', {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Falha ao buscar os anos disponíveis.')
  }

  const data = await response.json()

  return GetDebtsYearsResponse.parse(data)
}
