import { z } from 'zod'

const GetPurchasesYearsResponse = z.object({
  years: z.array(z.number()),
})

export async function getPurchasesYears() {
  const response = await fetch('http://localhost:3333/api/purchases/years', {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Falha ao buscar os anos disponíveis.')
  }

  const data = await response.json()

  return GetPurchasesYearsResponse.parse(data)
}
