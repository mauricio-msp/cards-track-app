import { useSuspenseQuery } from '@tanstack/react-query'
import { getMonthTotalAmountCard } from '@/features/credit-card/api/get-month-total-amount-card'
import { useDebtsFilter } from '@/hooks/store/use-debts-filter-store'

export function useMonthTotalAmountCard(cardId: string) {
  const { month, year } = useDebtsFilter()

  return useSuspenseQuery({
    queryKey: ['cards', cardId, 'month-total-amount', month, year],
    queryFn: () => getMonthTotalAmountCard({ id: cardId, month, year }),
    refetchOnWindowFocus: false,
  })
}
