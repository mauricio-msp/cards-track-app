import { z } from 'zod'
import { apiRequest, apiUrl } from '@/lib/api-client'

const AllCoverageItemSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  memberName: z.string(),
  cardId: z.string(),
  cardName: z.string(),
  targetMonth: z.number(),
  targetYear: z.number(),
  amount: z.number(),
  amountRepaid: z.number(),
  remaining: z.number(),
  settledAt: z.string().nullable(),
})

export const GetAllCoveragesResponseSchema = z.object({
  coverages: z.array(AllCoverageItemSchema),
  totalCovered: z.number(),
  totalRepaid: z.number(),
  totalRemaining: z.number(),
})

export type AllCoverageItem = z.infer<typeof AllCoverageItemSchema>
export type GetAllCoveragesResponse = z.infer<typeof GetAllCoveragesResponseSchema>

export async function getAllCoverages(params: { month?: number; year?: number }) {
  const url = apiUrl('/api/coverages')
  if (params.month !== undefined) url.searchParams.set('month', String(params.month))
  if (params.year !== undefined) url.searchParams.set('year', String(params.year))
  const data = await apiRequest(url)
  return GetAllCoveragesResponseSchema.parse(data)
}
