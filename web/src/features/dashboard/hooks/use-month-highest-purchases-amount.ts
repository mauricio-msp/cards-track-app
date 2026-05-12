import { useSuspenseQuery } from '@tanstack/react-query'
import { getMonthHighestPurchasesAmount } from '@/features/dashboard/api'

export function useMonthHighestPurchasesAmount() {
  return useSuspenseQuery({
    queryKey: ['month-highest-purchases-amount'],
    queryFn: getMonthHighestPurchasesAmount,
    refetchOnWindowFocus: false,
  })
}
