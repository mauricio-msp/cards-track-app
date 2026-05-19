import { useSuspenseQuery } from '@tanstack/react-query'
import { getCardPurchases } from '@/features/credit-card/api/get-card-purchases'
import { usePurchasesFilter } from '@/hooks/use-purchases-filter'

export function useCardPurchases(cardId: string) {
  const { month, year } = usePurchasesFilter()

  return useSuspenseQuery({
    queryKey: ['cards', cardId, 'purchases', month, year],
    queryFn: () => getCardPurchases({ id: cardId, month, year }),
    refetchOnWindowFocus: false,
  })
}
