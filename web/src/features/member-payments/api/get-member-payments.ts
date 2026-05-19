import { z } from 'zod'
import { apiRequest, apiUrl } from '@/lib/api-client'

const MemberPaymentSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  cardId: z.string(),
  targetMonth: z.number(),
  targetYear: z.number(),
  amount: z.number(),
  paidAt: z.string(),
  description: z.string(),
  createdAt: z.string(),
})

export const GetMemberPaymentsResponseSchema = z.object({
  payments: z.array(MemberPaymentSchema),
  totalPaid: z.number(),
  remaining: z.number(),
})

export type MemberPayment = z.infer<typeof MemberPaymentSchema>
export type GetMemberPaymentsResponse = z.infer<typeof GetMemberPaymentsResponseSchema>

export async function getMemberPayments(params: {
  memberId: string
  cardId: string
  month: number
  year: number
}) {
  const url = apiUrl(`/api/members/${params.memberId}/cards/${params.cardId}/payments`)
  url.searchParams.set('month', String(params.month))
  url.searchParams.set('year', String(params.year))
  const data = await apiRequest(url)
  return GetMemberPaymentsResponseSchema.parse(data)
}
