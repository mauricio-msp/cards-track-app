import { useSuspenseQuery } from '@tanstack/react-query'
import { getCard } from '@/features/credit-card/api/get-card'

export function useCard(cardId: string) {
  return useSuspenseQuery({
    queryKey: ['cards', cardId],
    queryFn: () => getCard({ id: cardId }),
    refetchOnWindowFocus: false,
  })
}
