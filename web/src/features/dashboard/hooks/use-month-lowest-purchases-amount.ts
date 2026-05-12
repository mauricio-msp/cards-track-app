import { useSuspenseQuery } from '@tanstack/react-query'
import { getMonthLowestPurchasesAmount } from '@/features/dashboard/api'

export function useMonthLowestPurchasesAmount() {
  return useSuspenseQuery({
    queryKey: ['month-lowest-purchases-amount'],
    queryFn: getMonthLowestPurchasesAmount,
    refetchOnWindowFocus: false,
  })
}
