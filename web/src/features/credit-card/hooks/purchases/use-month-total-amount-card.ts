import { useSuspenseQuery } from '@tanstack/react-query'
import { getMonthTotalAmountCard } from '@/features/credit-card/api/get-month-total-amount-card'
import { usePurchasesFilter } from '@/hooks/use-purchases-filter'

export function useMonthTotalAmountCard(cardId: string) {
  const { month, year } = usePurchasesFilter()

  return useSuspenseQuery({
    queryKey: ['cards', cardId, 'month-total-amount', month, year],
    queryFn: () => getMonthTotalAmountCard({ id: cardId, month, year }),
    refetchOnWindowFocus: false,
  })
}
