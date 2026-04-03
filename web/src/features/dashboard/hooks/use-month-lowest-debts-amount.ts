import { useSuspenseQuery } from '@tanstack/react-query'
import { getMonthLowestDebtsAmount } from '@/features/dashboard/api'

export function useMonthLowestDebtsAmount() {
  return useSuspenseQuery({
    queryKey: ['month-lowest-debts-amount'],
    queryFn: getMonthLowestDebtsAmount,
    refetchOnWindowFocus: false,
  })
}
