import { z } from 'zod'
import { apiRequest, apiUrl } from '@/lib/api-client'

const CoverageSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  cardId: z.string(),
  targetMonth: z.number(),
  targetYear: z.number(),
  amount: z.number(),
  coveredAt: z.string(),
  description: z.string().nullable(),
  amountRepaid: z.number(),
  settledAt: z.string().nullable(),
  remaining: z.number(),
  createdAt: z.string(),
})

export const GetMemberCoveragesResponseSchema = z.object({
  coverages: z.array(CoverageSchema),
  totalCovered: z.number(),
  totalRepaid: z.number(),
  totalRemaining: z.number(),
})

export type MemberCoverage = z.infer<typeof CoverageSchema>
export type GetMemberCoveragesResponse = z.infer<typeof GetMemberCoveragesResponseSchema>

export async function getMemberCoverages(params: {
  memberId: string
  cardId: string
  month: number
  year: number
}) {
  const url = apiUrl(`/api/members/${params.memberId}/cards/${params.cardId}/coverages`)
  url.searchParams.set('month', String(params.month))
  url.searchParams.set('year', String(params.year))
  const data = await apiRequest(url)
  return GetMemberCoveragesResponseSchema.parse(data)
}
