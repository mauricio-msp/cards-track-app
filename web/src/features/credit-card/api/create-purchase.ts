import { apiRequest } from '@/lib/api-client'

type CreatePurchaseRequest = {
  cardId: string
  members: Array<{
    id: string
    name: string
    amount: number
    startInstallment?: number
    endInstallment?: number
  }>
  category: string
  description: string
  installmentsCount: number
  purchaseDate: Date
  isRecurring?: boolean
  billingDay?: number
}

export async function createPurchase({
  cardId,
  members,
  category,
  description,
  purchaseDate,
  installmentsCount,
  isRecurring,
  billingDay,
}: CreatePurchaseRequest) {
  await apiRequest('/api/purchases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cardId,
      members,
      category,
      description,
      purchaseDate,
      installmentsCount,
      isRecurring,
      billingDay,
    }),
  })
}
