import { apiRequest } from '@/lib/api-client'

export type UpdateCoverageRepaymentParams = {
  memberId: string
  cardId: string
  coverageId: string
  amountRepaid?: number
  settled?: boolean
}

export async function updateCoverageRepayment(params: UpdateCoverageRepaymentParams) {
  const { memberId, cardId, coverageId, ...body } = params
  return apiRequest(
    `/api/members/${memberId}/cards/${cardId}/coverages/${coverageId}/repayment`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )
}
