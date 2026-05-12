import { z } from 'zod'

type GetCardPurchasesParams = {
  id: string
}

type GetCardPurchasesQuery = {
  year?: number
  month?: number
}

export const GetCardPurchasesItem = z.object({
  purchaseMemberId: z.string(),
  groupId: z.string(),
  description: z.string(),
  category: z.string().nullable(),
  purchaseDate: z.coerce.date(),
  totalAmount: z.coerce.number(),
  installmentsCount: z.coerce.number(),
  elapsedInstallments: z.coerce.number(),
  remainingInstallments: z.coerce.number(),
  anticipatedAt: z.string().nullish(),
  anticipatedInstallmentsCount: z.number().nullish(),
  anticipateFromInstallment: z.number().nullish(),
  anticipatableInstallments: z.coerce.number(),
  subscriptionId: z.string().nullish(),
  members: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      relationship: z.string(),
      installmentAmount: z.coerce.number(),
      perInstallmentAmount: z.coerce.number(),
    }),
  ),
})

const GetCardPurchasesResponse = z.object({
  purchases: z.array(GetCardPurchasesItem),
})

export async function getCardPurchases({ id, month, year }: GetCardPurchasesParams & GetCardPurchasesQuery) {
  const url = new URL(`http://localhost:3333/api/cards/${id}/purchases`)

  if (year?.toString()) url.searchParams.set('year', String(year))
  if (month?.toString()) url.searchParams.set('month', String(month))

  const response = await fetch(url, {
    credentials: 'include',
  })

  if (!response.ok) throw new Error('Erro ao buscar dívidas do cartão de crédito')

  const datas = await response.json()

  return GetCardPurchasesResponse.parse(datas)
}
