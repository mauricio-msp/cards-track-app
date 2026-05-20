import { apiRequest } from '@/lib/api-client'

type ParsePurchaseAIRequest = {
  text: string
  members: { id: string; name: string }[]
}

export type ParsedPurchaseAI = {
  description?: string
  purchaseDate?: string
  category?: string
  installmentsCount?: number
  isRecurring?: boolean
  members?: {
    id: string
    name: string
    amount: string
    startInstallment?: number | null
    endInstallment?: number | null
  }[]
}

export type ParsePurchaseAIResponse = {
  parsed: ParsedPurchaseAI
  missing: string[]
  unknownMemberNames: string[]
}

export async function parsePurchaseWithAI(
  body: ParsePurchaseAIRequest,
): Promise<ParsePurchaseAIResponse> {
  return apiRequest<ParsePurchaseAIResponse>('/api/ai/parse-purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
