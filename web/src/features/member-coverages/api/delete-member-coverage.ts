import { apiRequest } from '@/lib/api-client'

export async function deleteMemberCoverage(params: {
  memberId: string
  cardId: string
  coverageId: string
}) {
  return apiRequest(
    `/api/members/${params.memberId}/cards/${params.cardId}/coverages/${params.coverageId}`,
    { method: 'DELETE' },
  )
}
