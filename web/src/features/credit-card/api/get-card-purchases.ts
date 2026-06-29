import { z } from 'zod'
import { apiRequest, apiUrl } from '@/lib/api-client'

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
      totalOwed: z.coerce.number(),
    }),
  ),
})

const GetCardPurchasesResponse = z.object({
  purchases: z.array(GetCardPurchasesItem),
})

export async function getCardPurchases({ id, month, year }: GetCardPurchasesParams & GetCardPurchasesQuery) {
  const url = apiUrl(`/api/cards/${id}/purchases`)
  if (year !== undefined) url.searchParams.set('year', String(year))
  if (month !== undefined) url.searchParams.set('month', String(month))
  const data = await apiRequest(url)
  return GetCardPurchasesResponse.parse(data)
}
