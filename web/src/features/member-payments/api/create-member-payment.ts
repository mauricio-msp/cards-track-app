import { apiRequest } from '@/lib/api-client'

export type CreateMemberPaymentParams = {
  memberId: string
  cardId: string
  targetMonth: number
  targetYear: number
  amount: number
  paidAt: string
  description: string
}

export async function createMemberPayment(params: CreateMemberPaymentParams) {
  const { memberId, cardId, ...body } = params
  return apiRequest(`/api/members/${memberId}/cards/${cardId}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
