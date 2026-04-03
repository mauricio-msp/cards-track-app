import { useSuspenseQuery } from '@tanstack/react-query'
import { getCardDebts } from '@/features/credit-card/api/get-card-debts'
import { useDebtsFilter } from '@/hooks/store/use-debts-filter-store'

export function useCardDebts(cardId: string) {
  const { month, year } = useDebtsFilter()

  return useSuspenseQuery({
    queryKey: ['cards', cardId, 'debts', month, year],
    queryFn: () => getCardDebts({ id: cardId, month, year }),
    refetchOnWindowFocus: false,
  })
}
