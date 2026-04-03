import { z } from 'zod'

type GetCardDebtsParams = {
  id: string
}

type GetCardDebtsQuery = {
  year?: number
  month?: number
}

export const GetCardDebtsItem = z.object({
  debtId: z.string(),
  groupId: z.string(),
  description: z.string(),
  category: z.string(),
  purchaseDate: z.coerce.date(),
  totalAmount: z.coerce.number(),
  installmentsCount: z.coerce.number(),
  elapsedInstallments: z.coerce.number(),
  remainingInstallments: z.coerce.number(),
  anticipatedAt: z.string().nullish(),
  anticipatedInstallmentsCount: z.number().nullish(),
  anticipateFromInstallment: z.number().nullish(),
  members: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      relationship: z.string(),
      installmentAmount: z.coerce.number(),
    }),
  ),
})

const GetCardDebtsResponse = z.object({
  debts: z.array(GetCardDebtsItem),
})

export async function getCardDebts({ id, month, year }: GetCardDebtsParams & GetCardDebtsQuery) {
  const url = new URL(`http://localhost:3333/api/cards/${id}/debts`)

  if (year?.toString()) url.searchParams.set('year', String(year))
  if (month?.toString()) url.searchParams.set('month', String(month))

  const response = await fetch(url, {
    credentials: 'include',
  })

  if (!response.ok) throw new Error('Erro ao buscar dívidas do cartão de crédito')

  const datas = await response.json()

  return GetCardDebtsResponse.parse(datas)
}
