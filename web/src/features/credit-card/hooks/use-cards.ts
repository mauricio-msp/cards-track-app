import { useSuspenseQuery } from '@tanstack/react-query'
import { getCards } from '@/features/credit-card/api/get-cards'

export function useCards() {
  return useSuspenseQuery({
    queryKey: ['credit-cards'],
    queryFn: getCards,
    refetchOnWindowFocus: false,
  })
}
