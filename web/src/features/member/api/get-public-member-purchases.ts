import { z } from 'zod'
import { apiRequest, apiUrl } from '@/lib/api-client'

const GetPublicMemberPurchasesResponse = z.object({
  cardsWithPurchases: z.array(
    z.object({
      card: z.object({
        id: z.string(),
        name: z.string(),
        dueDay: z.coerce.number(),
        targetYear: z.coerce.number(),
        targetMonth: z.coerce.number(),
      }),
      purchases: z.array(
        z.object({
          id: z.string(),
          description: z.string(),
          purchaseDate: z.string(),
          amount: z.coerce.number(),
          installmentsCount: z.coerce.number(),
          installmentsAmount: z.coerce.number(),
          elapsedInstallments: z.coerce.number(),
          remainingInstallments: z.coerce.number(),
          anticipatedAt: z.string().nullish(),
          anticipatedInstallmentsCount: z.coerce.number().nullish(),
          anticipateFromInstallment: z.coerce.number().nullish(),
        }),
      ),
    }),
  ),
})

export async function getPublicMemberPurchases({
  id,
  month,
  year,
}: {
  id: string
  month?: number
  year?: number
}) {
  const url = apiUrl(`/api/public/members/${id}/purchases-by-card`)
  if (year !== undefined) url.searchParams.set('year', String(year))
  if (month !== undefined) url.searchParams.set('month', String(month))
  const data = await apiRequest(url)
  return GetPublicMemberPurchasesResponse.parse(data)
}
