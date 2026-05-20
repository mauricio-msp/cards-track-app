import { useMutation } from '@tanstack/react-query'
import { parsePurchaseWithAI } from '@/features/credit-card/api'

export function useParsePurchaseWithAI() {
  return useMutation({
    mutationFn: parsePurchaseWithAI,
  })
}
