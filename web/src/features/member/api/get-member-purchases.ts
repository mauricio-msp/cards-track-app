import { z } from 'zod'

type GetMemberPurchasesParams = {
  id: string
}

type GetMemberPurchasesQuery = {
  year?: number
  month?: number
}

const GetMemberPurchasesResponse = z.object({
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

export async function getMemberPurchases({
  id,
  month,
  year,
}: GetMemberPurchasesParams & GetMemberPurchasesQuery) {
  const url = new URL(`http://localhost:3333/api/members/${id}/purchases-by-card`)

  if (year?.toString()) url.searchParams.set('year', String(year))
  if (month?.toString()) url.searchParams.set('month', String(month))

  const response = await fetch(url, {
    credentials: 'include',
  })

  if (!response.ok) throw new Error('Falha ao solicitar dívidas de todos os cartões por membro.')

  const datas = await response.json()

  return GetMemberPurchasesResponse.parse(datas)
}
