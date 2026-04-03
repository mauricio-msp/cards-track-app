import { useSuspenseQuery } from '@tanstack/react-query'
import { getMonthHighestDebtsAmount } from '@/features/dashboard/api'

export function useMonthHighestDebtsAmount() {
  return useSuspenseQuery({
    queryKey: ['month-highest-debts-amount'],
    queryFn: getMonthHighestDebtsAmount,
    refetchOnWindowFocus: false,
  })
}
