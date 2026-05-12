import { useSuspenseQuery } from '@tanstack/react-query'
import { getMonthTotalPurchasesAmount } from '@/features/dashboard/api'

export function useMonthTotalPurchasesAmount() {
  return useSuspenseQuery({
    queryKey: ['month-total-purchases-amount'],
    queryFn: getMonthTotalPurchasesAmount,
    refetchOnWindowFocus: false,
  })
}
