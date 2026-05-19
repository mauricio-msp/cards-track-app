import { apiRequest } from '@/lib/api-client'

export async function deleteMemberPayment(params: {
  memberId: string
  cardId: string
  paymentId: string
}) {
  return apiRequest(
    `/api/members/${params.memberId}/cards/${params.cardId}/payments/${params.paymentId}`,
    { method: 'DELETE' },
  )
}
