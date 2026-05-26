import { apiRequest } from '@/lib/api-client'

export type CreateMemberCoverageParams = {
  memberId: string
  cardId: string
  targetMonth: number
  targetYear: number
  amount: number
  coveredAt: string
  description?: string
}

export async function createMemberCoverage(params: CreateMemberCoverageParams) {
  const { memberId, cardId, ...body } = params
  return apiRequest(`/api/members/${memberId}/cards/${cardId}/coverages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
