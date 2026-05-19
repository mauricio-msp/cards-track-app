import { apiRequest } from '@/lib/api-client'

export type UpdateMemberPaymentParams = {
  memberId: string
  cardId: string
  paymentId: string
  amount?: number
  paidAt?: string
  description?: string
}

export async function updateMemberPayment(params: UpdateMemberPaymentParams) {
  const { memberId, cardId, paymentId, ...body } = params
  return apiRequest(`/api/members/${memberId}/cards/${cardId}/payments/${paymentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
