import { apiRequest } from '@/lib/api-client'

type AnticipatePurchaseParams = {
  purchaseMemberId: string
}

type AnticipatePurchaseRequest = {
  anticipateCount: number
}

export async function anticipatePurchase({
  purchaseMemberId,
  anticipateCount,
}: AnticipatePurchaseParams & AnticipatePurchaseRequest) {
  return apiRequest(`/api/purchases/${purchaseMemberId}/anticipate`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ anticipateCount }),
  })
}
