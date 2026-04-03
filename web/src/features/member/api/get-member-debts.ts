import { z } from 'zod'

type GetMemberDebtsParams = {
  id: string
}

type GetMemberDebtsQuery = {
  year?: number
  month?: number
}

const GetMemberDebtsResponse = z.object({
  cardsWithDebts: z.array(
    z.object({
      card: z.object({
        id: z.string(),
        name: z.string(),
        dueDay: z.coerce.number(),
        targetYear: z.coerce.number(),
        targetMonth: z.coerce.number(),
      }),
      debts: z.array(
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

export async function getMemberDebts({
  id,
  month,
  year,
}: GetMemberDebtsParams & GetMemberDebtsQuery) {
  const url = new URL(`http://localhost:3333/api/members/${id}/debts-by-card`)

  if (year?.toString()) url.searchParams.set('year', String(year))
  if (month?.toString()) url.searchParams.set('month', String(month))

  const response = await fetch(url, {
    credentials: 'include',
  })

  if (!response.ok) throw new Error('Falha ao solicitar dívidas de todos os cartões por membro.')

  const datas = await response.json()

  return GetMemberDebtsResponse.parse(datas)
}
