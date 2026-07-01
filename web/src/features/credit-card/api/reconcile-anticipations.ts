import { z } from 'zod'
import { apiRequest } from '@/lib/api-client'

const ReconcileResponse = z.object({
  cotasAfetadas: z.number(),
  parcelasMovidas: z.number(),
  valorRealocado: z.number(),
})

export async function reconcileAnticipations(cardId: string) {
  const data = await apiRequest(`/api/cards/${cardId}/reconcile-anticipations`, {
    method: 'POST',
  })
  return ReconcileResponse.parse(data)
}
