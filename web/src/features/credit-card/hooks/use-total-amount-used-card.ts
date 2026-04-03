import { useSuspenseQuery } from '@tanstack/react-query'
import { getTotalAmountUsedCard } from '@/features/credit-card/api/get-total-amount-used-card'

export function useTotalAmountUsedCard(cardId: string) {
  return useSuspenseQuery({
    queryKey: ['cards', cardId, 'total-amount-used'],
    queryFn: () => getTotalAmountUsedCard({ id: cardId }),
    refetchOnWindowFocus: false,
  })
}
